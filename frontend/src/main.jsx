import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";

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
  //users will first LIKELY go here
  //they will see the top games of the website
  {
    path: "/charts",
    element: (
      <Layout>
        <Chart backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/games",
    children: [
      //specific game page /games/123
      {
        path: ":gameID",
        element: (
          <Layout>
            <GameDetail backend={backend} />
          </Layout>
        ),
      },
      //genres page  /games/genres
      {
        path: "genres",
        element: (
          <Layout>
            <Genres backend={backend} />
          </Layout>
        ),
      },
      //specific genre page /games/genres/456
      {
        path: "genres/:genreID",
        element: (
          <Layout>
            <GenreGames backend={backend} />
          </Layout>
        ),
      },
    ],
  },
  //user submit and edit tickets
  {
    path: "/submit",
    element: (
      <Layout>
        <Submit backend={backend} />
      </Layout>
    ),
    //makes it /submit/queue
    children: [
      {
        path: "queue",
        element: (
          <Layout>
            <Queue backend={backend} />
          </Layout>
        ),
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
