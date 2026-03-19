import { useEffect, useState } from "react";
import { socket } from "../socket";

function Gamepage() {
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const guestUsername = localStorage.getItem("guestUsername");

    if (!token && !guestUsername) {
      setError("No username/account found. Please login/enter a username");
      console.log("No user/login");
      return;
    }

    if (token) {
      socket.auth = { token };
    } else {
      socket.auth = {};
    }

    if (!socket.connected) {
      socket.connect();
    }

    function handleConnect() {
      if (guestUsername) {
        socket.emit("join", { username: guestUsername });
      } else {
        socket.emit("join", {});
      }
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Gamepage!</h1>
    </div>
  );
}

export default Gamepage;
