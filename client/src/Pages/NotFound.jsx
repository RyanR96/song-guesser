import { Link } from "react-router-dom";

function NotFound(props) {
  const { message } = props;
  return (
    <div className="min-h-screen flex justify-center">
      <div className="text-center mt-25">
        <h1 className="text-xl font-bold mb-4">{message}</h1>
        <Link
          to={"/"}
          className="inline-block bg-green-500 text-black px-5 py-2 rounded-full font-semibold hover:bg-green-300"
        >
          Return to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
