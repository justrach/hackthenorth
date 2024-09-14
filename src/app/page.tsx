import { auth, currentUser } from "@clerk/nextjs/server";
export default function Home() {
    const user = auth();
    // have clerk server functions here
    if(user.userId) {
        return (
            <div>
                <h1>Hello, world! You are signed in as {user.userId}</h1>
                <p>Welcome to your new Convex app!</p>
            </div>
        );
    }
    return (
        <div>
            <h1>Hello, world!</h1>  
            <p>Welcome to your new Convex app!</p>
        </div>
        
    );
}