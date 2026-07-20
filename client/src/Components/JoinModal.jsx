import { useState } from "react";

function joinModal(props) {
  const { onClose, onJoinSuccess, externalError } = props;
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted");

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    console.log("You are:", trimmedUsername);
    localStorage.setItem("guestUsername", trimmedUsername);
    onJoinSuccess();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          className="border-2 border-black"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-center"
          type="submit"
        >
          Join as guest
        </button>
      </form>
      {error ?? <p>{error}</p>}
    </div>
  );
}

export default joinModal;
