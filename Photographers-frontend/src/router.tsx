import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { AdminPage } from "./pages/AdminPage";
import HeaderBar from "./components/HeaderBar";
import useUserStore from "./stores/UserStore";
import TagsPage from "./pages/TagsPage";
import PhotosByTagPage from "./pages/PhotosByTagPage";
import { FriendsPage } from "./pages/FriendsPage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";

const AppRouter = () => {
  const Overview = lazy(() => import("./pages/Overview"));
  const DetailPage = lazy(() => import("./pages/Detail"));
  const { authenticated, user } = useUserStore();

  return (
    <BrowserRouter>
      <HeaderBar />
      <Suspense fallback={<></>}>
        <Routes>
          <Route path="/" element={<Navigate replace to="/photographers" />} />
          <Route element={<Overview />} path={"/photographers"} />
          <Route element={<DetailPage />} path={"/photographers/:id"} />
          <Route element={<AlbumDetailPage />} path={"/albums/:id"} />
          <Route path="/login" element={<Login />} />{" "}
          <Route path="/register" element={<Register />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tags/:tagName" element={<PhotosByTagPage />} />
          {authenticated && (
            <Route path="/recommendations" element={<RecommendationsPage />} />
          )}
          {authenticated && <Route path="/friends" element={<FriendsPage />} />}
          {authenticated && user?.role === "admin" && (
            <Route path="/admin" element={<AdminPage />} />
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
