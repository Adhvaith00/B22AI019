import React, { useState, useEffect } from "react";
import { Link2, Loader2, Copy } from "lucide-react";

const SESSION_TIMEOUT = 30 * 60 * 1000;

function App() {

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("loggedInUser"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("tinyurl");

  useEffect(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);

    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
        handleLogout();
      }
    }, 60 * 1000);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      clearInterval(interval);
    };
  }, [loggedIn]);

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      localStorage.setItem("loggedInUser", username);
      localStorage.setItem("lastActivity", Date.now().toString());
      setLoggedIn(true);
    } else {
      alert("Invalid credentials! (try admin / 1234)");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("lastActivity");
    setLoggedIn(false);
    setUrl("");
    setShortUrl("");
  };

  const shortenUrl = async () => {
    setError("");
    setShortUrl("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (url.split(" ").length > 1) {
      setError("Please enter only one URL at a time");
      return;
    }

    setLoading(true);
    try {
      let short = "";

      if (provider === "tinyurl") {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("TinyURL failed");
        short = await res.text();
      }

      if (provider === "isgd") {
        const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error("is.gd failed");
        short = await res.text();
      }

      setShortUrl(short);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: "12px" }}>Login</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleLogin} style={styles.loginBtn}>
            Login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <Link2 /> URL Shortener
        </h1>

        <select value={provider} onChange={(e) => setProvider(e.target.value)} style={styles.input}>
          <option value="tinyurl">TinyURL</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your URL"
          style={styles.input}
        />

        <button onClick={shortenUrl} disabled={loading} style={styles.shortenBtn}>
          {loading ? <Loader2 className="animate-spin" /> : "Shorten URL"}
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        {shortUrl && (
          <div style={styles.resultBox}>
            <p style={{ fontWeight: "600" }}>Shortened URL:</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <a href={shortUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                {shortUrl}
              </a>
              <Copy size={18} style={{ cursor: "pointer" }} onClick={() => navigator.clipboard.writeText(shortUrl)} />
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>

        <p style={{ marginTop: "10px", color: "gray", fontSize: "12px" }}>
          Session expires after 30 minutes of inactivity
        </p>
      </div>
    </div>
  );
}


const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
  },
  card: {
    padding: "20px",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  loginBtn: {
    width: "100%",
    padding: "8px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  shortenBtn: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  resultBox: {
    marginTop: "16px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f3f4f6",
  },
  logoutBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "8px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
};

export default App;