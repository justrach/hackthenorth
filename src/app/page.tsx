import { auth } from "@clerk/nextjs/server";
import LoggedInPage from "./(loggedin)/loggedInClient";
import { SignInButton } from "@clerk/nextjs";
import NewUserOnboarding from "./(loggedin)/loggedInUser";
import LandingPage from "./(landingpage)/LandingPage";

export default function Home() {
    const { userId } = auth();
    const user = auth();
    console.log(user.userId);

    if (userId) {
        return <NewUserOnboarding userId={userId} />;
    }

    return <LandingPage />;
}