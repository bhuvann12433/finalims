// src/pages/Login.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import MonsterSVG from "@/components/MonsterSVG";
import { initMonsterAnimation } from "@/utils/monsterAnimation";

import "./Login.css";

export default function Login() {
  // TRUE controlled input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const showPasswordRef = useRef<HTMLInputElement | null>(null);

  // Monster refs ONLY for SVG, NOT for inputs
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

  // Inputs used by animation (NOT controlled by React)
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
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

  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await signIn(username.trim(), password.trim());

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    navigate("/");
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
              emailInput: emailInputRef.current,
              passwordInput: passwordInputRef.current,
              showPasswordCheck: showPasswordRef.current,
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
          />
        </div>

        <div className="inputGroup">
          <label>Password</label>
          <input
            type="password"
            ref={passwordInputRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label id="showPasswordToggle">
            Show
            <input type="checkbox" ref={showPasswordRef} />
            <div className="indicator"></div>
          </label>
        </div>

        <button type="submit">Log in</button>
      </form>
    </div>
  );
}
