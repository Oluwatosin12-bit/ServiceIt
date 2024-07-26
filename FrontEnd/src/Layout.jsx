import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = ({ userData, socket }) => {
  return (
    <>
      <Header userData={userData} socket={socket} />
      <Outlet />
    </>
  );
};

export default Layout;
