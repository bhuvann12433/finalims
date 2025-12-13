// src/components/MonsterSVG.tsx
import React from "react";

export default function MonsterSVG({ refs }: any) {
  return (
    <svg
      className="mySVG"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
    >
      {/* MASK */}
      <defs>
        <circle id="armMaskPath" cx="100" cy="100" r="100" />
      </defs>

      <clipPath id="armMask">
        <use xlinkHref="#armMaskPath" overflow="visible" />
      </clipPath>

      <circle cx="100" cy="100" r="100" fill="#a9ddf3" />

      {/* BODY */}
      <g className="body">
        <path
          ref={refs.bodyBGchanged}
          className="bodyBGchanged"
          style={{ display: "none" }}
          fill="#FFFFFF"
          d="
            M200,122h-35h-14.9V72
            c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0
            l0,91h200L200,122z"
        />

        <path
          ref={refs.bodyBG}
          className="bodyBGnormal"
          stroke="#3A5E77"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#FFFFFF"
          d="
            M200,158.5
            c0-20.2-14.8-36.5-35-36.5h-14.9V72.8
            c0-27.4-21.7-50.4-49.1-50.8
            c-28-0.5-50.9,22.1-50.9,50v50H35.8
            C16,122,0,138,0,157.8L0,213h200L200,158.5z"
        />

        <path
          fill="#DDF1FA"
          d="
            M100,156.4
            c-22.9,0-43,11.1-54.1,27.7
            c15.6,10,34.2,15.9,54.1,15.9
            s38.5-5.8,54.1-15.9
            C143,167.5,122.9,156.4,100,156.4z"
        />
      </g>

      {/* EARS */}
      <g className="earL" ref={refs.outerEarL}>
        <g className="outerEar">
          <circle cx="47" cy="83" r="11.5" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" />
          <path
            d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1
               c0 2.3 1.9 4.1 4.1 4.1"
            stroke="#3a5e77"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <g className="earHair" ref={refs.earHairL}>
          <rect x="51" y="64" fill="#FFFFFF" width="15" height="35" />
          <path
            fill="#fff"
            stroke="#3a5e77"
            strokeWidth="2.5"
            d="
              M53.4 62.8
              C48.5 67.4 45 72.2 42.8 77
              c3.4-.1 6.8-.1 10.1.1
              c-4 3.7-6.8 7.6-8.2 11.6
              c2.1 0 4.2 0 6.3.2
              c-2.6 4.1-3.8 8.3-3.7 12.5
              c1.2-.7 3.4-1.4 5.2-1.9"
          />
        </g>
      </g>

      <g className="earR" ref={refs.outerEarR}>
        <g className="outerEar">
          <circle cx="153" cy="83" r="11.5" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5" />
          <path
            d="
              M153.7,78.9
              c2.3,0,4.1,1.9,4.1,4.1
              c0,2.3-1.9,4.1-4.1,4.1"
            stroke="#3a5e77"
            strokeWidth="2.5"
          />
        </g>
        <g className="earHair" ref={refs.earHairR}>
          <rect x="134" y="64" fill="#FFFFFF" width="15" height="35" />
          <path
            fill="#FFFFFF"
            stroke="#3A5E77"
            strokeWidth="2.5"
            d="
              M146.6,62.8
              c4.9,4.6,8.4,9.4,10.6,14.2
              c-3.4-0.1-6.8-0.1-10.1,0.1
              c4,3.7,6.8,7.6,8.2,11.6
              c-2.1,0-4.2,0-6.3,0.2
              c2.6,4.1,3.8,8.3,3.7,12.5
              c-1.2-0.7-3.4-1.4-5.2-1.9"
          />
        </g>
      </g>

      {/* FACE */}
      <path ref={refs.chin} className="chin" stroke="#3a5e77" strokeWidth="2.5" fill="none"
        d="
          M84.1 121.6
          c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5
          c2.9 2.5 6.3 4.8 10.2 6.5
          c0-1.9-.1-3.9-.2-5.8
          c3 1.2 6.2 2 9.7 2.5
          c-.3-2.1-.7-4.1-1.2-6.1"
      />

      <path ref={refs.face}
        className="face"
        fill="#DDF1FA"
        d="
          M134.5,46v35.5
          c0,21.815-15.446,39.5-34.5,39.5
          s-34.5-17.685-34.5-39.5V46"
      />

      {/* HAIR */}
      <path
        ref={refs.hair}
        className="hair"
        fill="#FFFFFF"
        stroke="#3A5E77"
        strokeWidth="2.5"
        d="
          M81.457,27.929
          c1.755-4.084,5.51-8.262,11.253-11.77
          c0.979,2.565,1.883,5.14,2.712,7.723
          c3.162-4.265,8.626-8.27,16.272-11.235
          c-0.737,3.293-1.588,6.573-2.554,9.837
          c4.857-2.116,11.049-3.64,18.428-4.156
          c-2.403,3.23-5.021,6.391-7.852,9.474"
      />

      {/* EYEBROWS */}
      <g className="eyebrow" ref={refs.eyebrow}>
        <path
          fill="#FFFFFF"
          d="
            M138.142,55.064
            c-4.93,1.259-9.874,2.118-14.787,2.599
            c-0.336,3.341-0.776,6.689-1.322,10.037
            c-4.569-1.465-8.909-3.222-12.996-5.226
            c-0.98,3.075-2.07,6.137-3.267,9.179
            c-5.514-3.067-10.559-6.545-15.097-10.329
            c-1.806,2.889-3.745,5.73-5.816,8.515
            c-7.916-4.124-15.053-9.114-21.296-14.738
            l1.107-11.768h73.475V55.064z"
        />

        <path
          fill="#FFFFFF"
          stroke="#3A5E77"
          strokeWidth="2.5"
          d="
            M63.56,55.102
            c6.243,5.624,13.38,10.614,21.296,14.738
            c2.071-2.785,4.01-5.626,5.816-8.515
            c4.537,3.785,9.583,7.263,15.097,10.329
            c1.197-3.043,2.287-6.104,3.267-9.179
            c4.087,2.004,8.427,3.761,12.996,5.226
            c0.545-3.348,0.986-6.696,1.322-10.037
            c4.913-0.481,9.857-1.34,14.787-2.599"
        />
      </g>

      {/* EYES */}
      <g className="eyeL" ref={refs.eyeL}>
        <circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77" />
        <circle cx="84" cy="76" r="1" fill="#fff" />
      </g>

      <g className="eyeR" ref={refs.eyeR}>
        <circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77" />
        <circle cx="113" cy="76" r="1" fill="#fff" />
      </g>

      {/* MOUTH */}
      <g className="mouth" ref={refs.mouth}>
        <path ref={refs.mouthBG}
          className="mouthBG"
          fill="#617E92"
          d="
            M100.2,101c-0.4,0-1.4,0-1.8,0
            c-2.7-0.3-5.3-1.1-8-2.5
            c-0.7-0.3-0.9-1.2-0.6-1.8
            c0.2-0.5,0.7-0.7,1.2-0.7
            c0.2,0,0.5,0.1,0.6,0.2
            c3,1.5,5.8,2.3,8.6,2.3
            s5.7-0.7,8.6-2.3
            c0.2-0.1,0.4-0.2,0.6-0.2
            c0.5,0,1,0.3,1.2,0.7
            c0.4,0.7,0.1,1.5-0.6,1.9
            c-2.6,1.4-5.3,2.2-7.9,2.5
            C101.7,101,100.5,101,100.2,101z"
        />

        <path ref={refs.mouthSmallBG}
          className="mouthSmallBG"
          style={{ display: "none" }}
          fill="#617E92"
          d="
            M100.2,101
            c-0.4,0-1.4,0-1.8,0
            c-2.7-0.3-5.3-1.1-8-2.5
            c-0.7-0.3-0.9-1.2-0.6-1.8
            c0.2-0.5,0.7-0.7,1.2-0.7"
        />

        <path
          ref={refs.mouthMediumBG}
          className="mouthMediumBG"
          style={{ display: "none" }}
          d="
            M95,104.2
            c-4.5,0-8.2-3.7-8.2-8.2v-2
            c0-1.2,1-2.2,2.2-2.2h22
            c1.2,0,2.2,1,2.2,2.2v2
            c0,4.5-3.7,8.2-8.2,8.2H95z"
        />

        <path
          ref={refs.mouthLargeBG}
          className="mouthLargeBG"
          style={{ display: "none" }}
          fill="#617e92"
          stroke="#3a5e77"
          strokeWidth="2.5"
          d="
            M100 110.2
            c-9 0-16.2-7.3-16.2-16.2
            c0-2.3 1.9-4.2 4.2-4.2h24
            c2.3 0 4.2 1.9 4.2 4.2
            c0 9-7.2 16.2-16.2 16.2z"
        />

        <path ref={refs.mouthMaskPath}
          id="mouthMaskPath"
          style={{ display: "none" }}
          d="
            M100.2,101c-0.4,0-1.4,0-1.8,0
            c-2.7-0.3-5.3-1.1-8-2.5
            c-0.7-0.3-0.9-1.2-0.6-1.8
            c0.2-0.5,0.7-0.7,1.2-0.7
            c0.2,0,0.5,0.1,0.6,0.2
            c3,1.5,5.8,2.3,8.6,2.3
            s5.7-0.7,8.6-2.3
            c0.2-0.1,0.4-0.2,0.6-0.2
            c0.5,0,1,0.3,1.2,0.7
            c0.4,0.7,0.1,1.5-0.6,1.9
            c-2.6,1.4-5.3,2.2-7.9,2.5
            C101.7,101,100.5,101,100.2,101z"
        />

        <clipPath id="mouthMask">
          <use xlinkHref="#mouthMaskPath" overflow="visible" />
        </clipPath>

        <g clipPath="url(#mouthMask)">
          <g className="tongue" ref={refs.tongue}>
            <circle cx="100" cy="107" r="8" fill="#cc4a6c" />
            <ellipse
              className="tongueHighlight"
              cx="100"
              cy="100.5"
              rx="3"
              ry="1.5"
              opacity=".1"
              fill="#fff"
            />
          </g>
        </g>

        <path
          ref={refs.tooth}
          className="tooth"
          fill="#FFFFFF"
          d="M106,97h-4c-1.1,0-2-0.9-2-2v-2h8v2
          C108,96.1,107.1,97,106,97z"
        />

        <path
          ref={refs.mouthOutline}
          className="mouthOutline"
          fill="none"
          stroke="#3A5E77"
          strokeWidth="2.5"
          d="
            M100.2,101c-0.4,0-1.4,0-1.8,0
            c-2.7-0.3-5.3-1.1-8-2.5
            c-0.7-0.3-0.9-1.2-0.6-1.8
            c0.2-0.5,0.7-0.7,1.2-0.7
            c0.2,0,0.5,0.1,0.6,0.2
            c3,1.5,5.8,2.3,8.6,2.3
            s5.7-0.7,8.6-2.3
            c0.2-0.1,0.4-0.2,0.6-0.2
            c0.5,0,1,0.3,1.2,0.7
            c0.4,0.7,0.1,1.5-0.6,1.9
            c-2.6,1.4-5.3,2.2-7.9,2.5
            C101.7,101,100.5,101,100.2,101z"
        />
      </g>

      {/* NOSE */}
      <path
        ref={refs.nose}
        className="nose"
        fill="#3a5e77"
        d="
          M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3
          c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3
          c-1.3-1.6-.2-3.7 1.8-3.7z"
      />

      {/* ARMS */}
      <g className="arms" clipPath="url(#armMask)">
        <g className="armL" ref={refs.armL} style={{ visibility: "hidden" }}>
          <path
            fill="#DDF1FA"
            stroke="#3A5E77"
            strokeWidth="2.5"
            d="M121.3,98.4 111,59.7 149.8,49.3 169.8,85.4"
          />
        </g>

        <g className="armR" ref={refs.armR} style={{ visibility: "hidden" }}>
          <path
            fill="#ddf1fa"
            stroke="#3a5e77"
            strokeWidth="2.5"
            d="
              M265.4 97.3l10.4-38.6-38.9-10.5-20 36.1z"
          />
        </g>
      </g>
    </svg>
  );
}
