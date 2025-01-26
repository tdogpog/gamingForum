import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";

const backend = "http://localhost:3000/";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/auth",
    element: (
      <Layout>
        <Login backend={backend} />
      </Layout>
    ),
  },
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
    element: (
      <Layout>
        <Games backend={backend} />
      </Layout>
    ),
  },
  {
    path: "/charts",
    element: (
      <Layout>
        <Submit backend={backend} />
      </Layout>
    ),
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
