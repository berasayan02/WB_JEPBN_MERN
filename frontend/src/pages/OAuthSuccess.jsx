import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Google OAuth redirects the browser to /oauth-success?token=... after the
// backend has verified the user and issued a JWT. We store the token, fetch
// the profile, then send the user into the app.
export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login?error=google_auth_failed");
      return;
    }

    localStorage.setItem("token", token);

    api
      .get("/auth/me")
      .then(({ data }) => {
        login(token, data.user);
        navigate("/");
      })
      .catch(() => {
        navigate("/login?error=google_auth_failed");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="loading-wrap">Signing you in with Google...</div>;
}
