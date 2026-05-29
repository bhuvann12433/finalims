import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MonsterSVG from "@/components/MonsterSVG";
import { initMonsterAnimation } from "@/utils/monsterAnimation";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const showPasswordRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  // Monster refs
  const eyeL = useRef(null);
  const eyeR = useRef(null);
  const nose = useRef(null);
  const mouth = useRef(null);
  const mouthBG = useRef(null);
  const mouthSmallBG = useRef(null);
  const mouthMediumBG = useRef(null);
  const mouthLargeBG = useRef(null);
  const mouthMaskPath = useRef(null);
  const mouthOutline = useRef(null);
  const tooth = useRef(null);
  const tongue = useRef(null);
  const chin = useRef(null);
  const face = useRef(null);
  const eyebrow = useRef(null);
  const hair = useRef(null);
  const outerEarL = useRef(null);
  const outerEarR = useRef(null);
  const earHairL = useRef(null);
  const earHairR = useRef(null);
  const bodyBG = useRef(null);
  const bodyBGchanged = useRef(null);
  const armL = useRef(null);
  const armR = useRef(null);
  const twoFingers = useRef(null);

  // Init animation
  useEffect(() => {
    if (!svgContainerRef.current) return;

    initMonsterAnimation({
      svgContainer: svgContainerRef.current,
      emailInput: emailInputRef.current,
      passwordInput: passwordInputRef.current,
      showPasswordCheck: showPasswordRef.current,
      eyeL: eyeL.current,
      eyeR: eyeR.current,
      nose: nose.current,
      mouth: mouth.current,
      mouthBG: mouthBG.current,
      mouthSmallBG: mouthSmallBG.current,
      mouthMediumBG: mouthMediumBG.current,
      mouthLargeBG: mouthLargeBG.current,
      mouthMaskPath: mouthMaskPath.current,
      mouthOutline: mouthOutline.current,
      tooth: tooth.current,
      tongue: tongue.current,
      chin: chin.current,
      face: face.current,
      eyebrow: eyebrow.current,
      hair: hair.current,
      outerEarL: outerEarL.current,
      outerEarR: outerEarR.current,
      earHairL: earHairL.current,
      earHairR: earHairR.current,
      bodyBG: bodyBG.current,
      bodyBGchanged: bodyBGchanged.current,
      armL: armL.current,
      armR: armR.current,
      twoFingers: twoFingers.current,
    });
  }, []);

  // Login handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Enter username and password",
        variant: "destructive",
      });
      return;
    }

    if (loading) return;

    setLoading(true);

    const { error } = await signIn(username.trim(), password.trim());

    setLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const session = JSON.parse(localStorage.getItem("session") || "{}");
    const role = (session.user?.role || "").toLowerCase();

    toast({ title: "Login Successful" });

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/sales/invoices", { replace: true });
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <div className="svgContainer" ref={svgContainerRef}>
          <MonsterSVG
            refs={{
              eyeL,
              eyeR,
              nose,
              mouth,
              mouthBG,
              mouthSmallBG,
              mouthMediumBG,
              mouthLargeBG,
              mouthMaskPath,
              mouthOutline,
              tooth,
              tongue,
              chin,
              face,
              eyebrow,
              hair,
              outerEarL,
              outerEarR,
              earHairL,
              earHairR,
              bodyBG,
              bodyBGchanged,
              armL,
              armR,
              twoFingers,
            }}
          />
        </div>

        <div className="inputGroup">
          <label>USERNAME</label>
          <input
            type="text"
            ref={emailInputRef}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="inputGroup">
          <label>Password</label>
          <input
            type="password"
            ref={passwordInputRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label id="showPasswordToggle">
            Show <input type="checkbox" ref={showPasswordRef} />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}