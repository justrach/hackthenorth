WITH user_message_stats AS (
    SELECT 
        ud.username,
        m.senderId,
        COUNT(*) as message_count,
        COUNT(DISTINCT meetupChatId) as unique_meetups,
        MAX(CAST(SUBSTRING(m._creationTime, 1, 13) AS BIGINT) / 1000) as last_message_time,
        MIN(CAST(SUBSTRING(m._creationTime, 1, 13) AS BIGINT) / 1000) as first_message_time
    FROM workspace.default.messages m
    JOIN workspace.default.user_details ud ON m.senderId = ud.id
    GROUP BY ud.username, m.senderId
),
meetup_activity AS (
    SELECT 
        meetupChatId,
        COUNT(*) as message_count,
        COUNT(DISTINCT senderId) as unique_users,
        MAX(CAST(SUBSTRING(_creationTime, 1, 13) AS BIGINT) / 1000) as last_activity,
        MIN(CAST(SUBSTRING(_creationTime, 1, 13) AS BIGINT) / 1000) as first_activity
    FROM workspace.default.messages
    GROUP BY meetupChatId
),
recent_users AS (
    SELECT COUNT(DISTINCT senderId) as active_users
    FROM workspace.default.messages
    WHERE CAST(SUBSTRING(_creationTime, 1, 13) AS BIGINT) / 1000 >= UNIX_TIMESTAMP(CURRENT_DATE - INTERVAL 7 DAYS)
),
total_users AS (
    SELECT COUNT(*) as total
    FROM workspace.default.user_details
),
engagement_rate AS (
    SELECT 
        active_users,
        total,
        CAST(active_users AS FLOAT) / CAST(total AS FLOAT) as engagement_rate
    FROM recent_users, total_users
),
combined_results AS (
    SELECT 
        'User Message Statistics' as analysis_type,
        username,
        message_count,
        unique_meetups,
        FROM_UNIXTIME(last_message_time) as last_message_time,
        FROM_UNIXTIME(first_message_time) as first_message_time,
        NULL as meetup_chat_id,
        NULL as unique_users,
        NULL as active_users,
        NULL as total_users,
        NULL as engagement_rate,
        1 as sort_order
    FROM user_message_stats
    WHERE message_count > 0

    UNION ALL

    SELECT
        'Top 10 Most Active Users' as analysis_type,
        username,
        message_count,
        unique_meetups,
        FROM_UNIXTIME(last_message_time) as last_message_time,
        FROM_UNIXTIME(first_message_time) as first_message_time,
        NULL as meetup_chat_id,
        NULL as unique_users,
        NULL as active_users,
        NULL as total_users,
        NULL as engagement_rate,
        2 as sort_order
    FROM user_message_stats

    UNION ALL

    SELECT
        'Meetup Chat Activity' as analysis_type,
        NULL as username,
        message_count,
        NULL as unique_meetups,
        FROM_UNIXTIME(last_activity) as last_message_time,
        FROM_UNIXTIME(first_activity) as first_message_time,
        meetupChatId as meetup_chat_id,
        unique_users,
        NULL as active_users,
        NULL as total_users,
        NULL as engagement_rate,
        3 as sort_order
    FROM meetup_activity
    WHERE message_count > 0

    UNION ALL

    SELECT
        'User Engagement (Last 7 Days)' as analysis_type,
        NULL as username,
        NULL as message_count,
        NULL as unique_meetups,
        NULL as last_message_time,
        NULL as first_message_time,
        NULL as meetup_chat_id,
        NULL as unique_users,
        active_users,
        total as total_users,
        engagement_rate,
        4 as sort_order
    FROM engagement_rate
)
SELECT *
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY analysis_type ORDER BY 
            CASE 
                WHEN analysis_type = 'Top 10 Most Active Users' THEN message_count
                WHEN analysis_type = 'Meetup Chat Activity' THEN message_count
                ELSE NULL 
            END DESC NULLS LAST) as rn
    FROM combined_results
)
WHERE (analysis_type = 'Top 10 Most Active Users' AND rn <= 10) OR analysis_type != 'Top 10 Most Active Users'
ORDER BY sort_order, 
    CASE 
        WHEN analysis_type = 'User Message Statistics' THEN message_count
        WHEN analysis_type = 'Meetup Chat Activity' THEN message_count
        ELSE NULL 
    END DESC NULLS LAST
LIMIT 1000