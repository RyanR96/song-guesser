import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";

function Layout(props) {
  const { currentUser, onAuthSuccess, onLogout } = props;

  return (
    <div>
      <Navbar
        currentUser={currentUser}
        onAuthSuccess={onAuthSuccess}
        onLogout={onLogout}
      />
      <Outlet />
    </div>
  );
}

export default Layout;
