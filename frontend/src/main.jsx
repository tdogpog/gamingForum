import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import { AuthProvider } from "./authContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Chart from "./pages/Chart";
import Signup from "./pages/Signup";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import Genres from "./pages/Genres";
import GenreGames from "./pages/GenreGames";
import Game from "./pages/Game";
// import GenreVoting from "./pages/GenreVoting";

const backend = "http://localhost:3000/";

const router = createBrowserRouter([
  //landing page that should explain the premise of the website
  // and how they can interact with
  //users need guidance or its just gonna look like nothing
  {
    path: "/",
    element: (
      <Layout>
        <Home backend={backend} />
      </Layout>
    ),
  },
  //page for user log in that is accessed from the Layout
  {
    path: "/auth",
    element: (
      <Layout>
        <Login backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/signup",
    element: (
      <Layout>
        <Signup backend={backend} />
      </Layout>
    ),
  },
  // users will first LIKELY go here
  // they will see the top games of the website
  {
    path: "/charts",
    element: (
      <Layout>
        <Chart backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/games/:gameSlug",
    element: (
      <Layout>
        <Game backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/games/genres",
    element: (
      <Layout>
        <Genres backend={backend} />
      </Layout>
    ),
  },

  {
    path: "/games/genres/:genreSlug",
    element: (
      <Layout>
        <GenreGames backend={backend} />
      </Layout>
    ),
  },

  // {
  //   path: "/games/:gameSlug/genrevote",
  //   element: (
  //     <Layout>
  //       <GenreVoting backend={backend} />
  //     </Layout>
  //   ),
  // },

  // //user submit and edit tickets
  // {
  //   path: "/submit",
  //   element: (
  //     <Layout>
  //       <Submit backend={backend} />
  //     </Layout>
  //   ),
  //   //makes it /submit/queue
  //   children: [
  //     {
  //       path: "queue",
  //       element: (
  //         <Layout>
  //           <Queue backend={backend} />
  //         </Layout>
  //       ),
  //     },
  //   ],
  // },
  {
    path: "/user/:username",
    element: (
      <Layout>
        <UserProfile backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/user/settings",
    element: (
      <Layout>
        <Settings backend={backend} />
      </Layout>
    ),
  },
]);

//context wrapped
//you can access logged in
//user id, username,user role
//from the context at any point from the decoded localstorage(token) jwt
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
