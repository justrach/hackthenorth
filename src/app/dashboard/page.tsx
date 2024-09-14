import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import DashboardPage from "./clientPage";

export default function Home() {
    const { userId } = auth();
    const user = auth();
    console.log(user.userId);

    if (userId) {
        return <DashboardPage userId={userId} />;
    }

    return (
        <div>
            <h1>Welcome to our app!</h1>
            <p>Please sign in to continue.</p>
            <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Sign In
                </button>
            </SignInButton>
        </div>
    );
}