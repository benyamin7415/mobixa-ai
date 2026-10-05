     <style jsx global>{`
        /* =====================================================
           ROOT
        ===================================================== */

        html:has(.im-root),
        body:has(.im-root) {
          background: #dcd6ff;
        }

        body:has(.im-root)::before,
        body:has(.im-root)::after {
          display: none;
        }

        .im-root {
          --ink: #1b1740;
          --muted: rgba(27, 23, 64, 0.64);
          --violet: #6d4cff;
          --blue: #3e7bff;
          --cyan: #1fc3f2;
          --pink: #ff5fae;

          position: relative;
          z-index: 0;
          isolation: isolate;
          min-height: 100vh;
          overflow-x: clip;
          color: var(--ink);
          font-family:
            "Vazirmatn",
            Tahoma,
            "Segoe UI",
            Arial,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(
              90% 40% at 50% 0%,
              rgba(255, 255, 255, 0.7),
              transparent 70%
            ),
            linear-gradient(
              180deg,
              #d9d3ff 0%,
              #cfe0ff 34%,
              #e3d9ff 66%,
              #f1dbf3 100%
            );
        }

        :where(.im-root h1, .im-root p) {
          margin: 0;
        }

        :where(.im-root a) {
          color: inherit;
          text-decoration: none;
        }

        :where(.im-root button) {
          font: inherit;
          color: inherit;
        }

        .im-root button {
          -webkit-tap-highlight-color: transparent;
        }

        .im-root a:focus-visible,
        .im-root button:focus-visible,
        .im-root textarea:focus-visible {
          outline: 2px solid rgba(109, 76, 255, 0.9);
          outline-offset: 3px;
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .im-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .im-aurora {
          position: absolute;
          top: -280px;
          left: 50%;
          width: 860px;
          height: 860px;
          margin-left: -430px;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              rgba(109, 76, 255, 0),
              rgba(109, 76, 255, 0.4),
              rgba(31, 195, 242, 0.34),
              rgba(255, 95, 174, 0.34),
              rgba(255, 180, 138, 0.28),
              rgba(109, 76, 255, 0)
            );
          filter: blur(64px);
          opacity: 0.85;
          animation: imSpin 50s linear infinite;
        }

        .im-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }

        .im-blob.b1 {
          top: 220px;
          left: -180px;
          width: 340px;
          height: 340px;
          background: rgba(139, 108, 255, 0.45);
          animation: imDriftA 20s ease-in-out infinite alternate;
        }

        .im-blob.b2 {
          top: 760px;
          right: -190px;
          width: 360px;
          height: 360px;
          background: rgba(31, 195, 242, 0.36);
          animation: imDriftB 24s ease-in-out infinite alternate;
        }

        .im-blob.b3 {
          top: 1300px;
          left: -170px;
          width: 340px;
          height: 340px;
          background: rgba(255, 111, 181, 0.34);
          animation: imDriftA 26s ease-in-out infinite alternate;
        }

        .im-grid {
          position: absolute;
          inset: 0 0 auto 0;
          height: 900px;
          background-image:
            radial-gradient(
              rgba(80, 60, 200, 0.22) 1px,
              transparent 1.4px
            );
          background-size: 24px 24px;
          -webkit-mask-image: linear-gradient(#000, transparent 85%);
          mask-image: linear-gradient(#000, transparent 85%);
        }

        .im-star {
          position: absolute;
          width: 14px;
          height: 14px;
          color: #fff;
          filter:
            drop-shadow(0 0 6px rgba(109, 76, 255, 0.9))
            drop-shadow(0 0 14px rgba(109, 76, 255, 0.5));
          animation: imTwinkle 4.2s ease-in-out infinite;
        }

        .im-star svg {
          width: 100%;
          height: 100%;
        }

        .im-star.s1 { top: 150px; left: 10%; }
        .im-star.s2 { top: 240px; right: 11%; width: 18px; height: 18px; animation-delay: 0.9s; }
        .im-star.s3 { top: 520px; left: 6%; width: 10px; height: 10px; animation-delay: 1.7s; }
        .im-star.s4 { top: 640px; right: 8%; width: 12px; height: 12px; animation-delay: 2.4s; }

        .im-grain {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          mix-blend-mode: overlay;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .im-header {
          position: fixed;
          top: 12px;
          inset-inline: 12px;
          z-index: 70;
          max-width: 1120px;
          height: 60px;
          margin-inline: auto;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 14px 40px rgba(70, 55, 190, 0.16);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          animation: imDrop 0.8s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          direction: ltr;
        }

        .im-logo-word {
          font-family: "Sora", "Vazirmatn", sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .im-logo b {
          padding: 3px 7px 3px 9px;
          border-radius: 7px;
          font-family: "Sora", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          box-shadow: 0 6px 16px rgba(100, 80, 240, 0.4);
        }

        .im-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 22px rgba(80, 60, 200, 0.14);
          transition:
            transform 0.25s cubic-bezier(.2,.8,.2,1),
            background 0.25s ease;
        }

        .im-back svg {
          width: 17px;
          height: 17px;
        }

        .im-back:hover {
          transform: translateY(-1px);
          background: #fff;
        }

        /* =====================================================
           LAYOUT / HERO
        ===================================================== */

        .im-wrap {
          position: relative;
          max-width: 1120px;
          margin: 0 auto;
          padding: 100px 16px 28px;
        }

        .im-in {
          animation: imRise 0.95s cubic-bezier(.2,.8,.2,1) var(--d, 0s) both;
        }

        .im-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .im-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: "Sora", sans-serif;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #4a36d6;
          direction: ltr;
          background: rgba(255, 255, 255, 0.66);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 10px 28px rgba(100, 80, 230, 0.18);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .im-eyebrow-star {
          width: 15px;
          height: 15px;
          color: var(--pink);
          animation: imSpin 9s linear infinite;
        }

        .im-eyebrow-star svg {
          width: 100%;
          height: 100%;
        }

        .im-title {
          margin-top: 18px;
          font-size: clamp(34px, 7.6vw, 64px);
          line-height: 1.3;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .im-title span {
          background: linear-gradient(
            90deg,
            #5b3df0,
            #2f7bff,
            #ff5fae,
            #5b3df0
          );
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: imGradText 7s linear infinite;
        }

        .im-sub {
          max-width: 520px;
          margin-top: 14px;
          font-size: clamp(14.5px, 2.4vw, 17px);
          line-height: 2;
          color: var(--muted);
        }

        .im-grid-layout {
          display: grid;
          gap: 22px;
          margin-top: 30px;
          align-items: start;
        }

        .im-grid-layout > * {
          min-width: 0;
        }

        /* =====================================================
           STUDIO
        ===================================================== */

        .im-studio {
          position: relative;
          padding: 20px;
          border-radius: 30px;
          background:
            linear-gradient(
              160deg,
              rgba(255, 255, 255, 0.88),
              rgba(255, 255, 255, 0.58)
            );
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 26px 60px rgba(70, 55, 190, 0.16),
            inset 0 1px 0 #fff;
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .im-studio:focus-within {
          border-color: rgba(124, 92, 255, 0.55);
          box-shadow:
            0 0 0 4px rgba(124, 92, 255, 0.14),
            0 30px 70px rgba(70, 55, 190, 0.22),
            inset 0 1px 0 #fff;
        }

        .im-studio-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .im-studio-title {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 800;
        }

        .im-studio-title i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 12px var(--violet);
          animation: imPulseDot 1.8s ease-in-out infinite;
        }

        .im-surprise {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border: 0;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          color: #4a36d6;
          cursor: pointer;
          background: rgba(109, 76, 255, 0.12);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            background 0.25s ease;
        }

        .im-surprise svg {
          width: 18px;
          height: 18px;
          transition: transform 0.5s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-surprise:hover:not(:disabled) {
          transform: translateY(-2px);
          background: rgba(109, 76, 255, 0.2);
        }

        .im-surprise:hover:not(:disabled) svg {
          transform: rotate(-18deg) scale(1.12);
        }

        .im-surprise:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-field {
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(109, 76, 255, 0.16);
          transition: border-color 0.25s ease;
        }

        .im-field:focus-within {
          border-color: rgba(124, 92, 255, 0.5);
        }

        .im-field textarea {
          display: block;
          width: 100%;
          min-height: 112px;
          max-height: 260px;
          padding: 16px 18px 6px;
          border: 0;
          outline: 0;
          resize: none;
          background: transparent;
          color: var(--ink);
          caret-color: #6a4df0;
          font: inherit;
          font-size: 16px;
          line-height: 1.95;
          text-align: start;
        }

        .im-field textarea::placeholder {
          color: rgba(27, 23, 64, 0.42);
        }

        .im-field textarea:disabled {
          opacity: 0.6;
        }

        .im-field-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 12px 10px 14px;
        }

        .im-counter {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          direction: ltr;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.5);
        }

        .im-counter svg {
          width: 22px;
          height: 22px;
          transform: rotate(-90deg);
        }

        .im-counter circle {
          fill: none;
          stroke-width: 2.6;
        }

        .im-counter .track {
          stroke: rgba(27, 23, 64, 0.1);
        }

        .im-counter .bar {
          stroke: #6d4cff;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.25s ease;
        }

        .im-copy {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border: 0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.55);
          background: transparent;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .im-copy svg {
          width: 15px;
          height: 15px;
        }

        .im-copy:hover:not(:disabled) {
          color: #4a36d6;
          background: rgba(109, 76, 255, 0.1);
        }

        .im-copy:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* styles */

        .im-styles {
          margin-top: 16px;
        }

        .im-styles-label {
          display: block;
          margin-bottom: 9px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(27, 23, 64, 0.55);
        }

        .im-styles-row {
          display: flex;
          gap: 8px;
          margin: 0 -20px;
          padding: 2px 20px 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .im-styles-row::-webkit-scrollbar {
          display: none;
        }

        .im-style {
          flex: 0 0 auto;
          padding: 9px 16px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 6px 16px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-style:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .im-style.on {
          color: #fff;
          background: linear-gradient(135deg, #7c5cff, #3e7bff);
          border-color: transparent;
          box-shadow: 0 10px 24px rgba(100, 80, 240, 0.4);
          transform: scale(1.04);
        }

        .im-style:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* generate */

        .im-cta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 16px;
        }

        .im-hint-keys {
          display: none;
          align-items: center;
          gap: 5px;
        }

        .im-hint-keys kbd {
          padding: 4px 9px;
          border-radius: 8px;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(27, 23, 64, 0.55);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(27, 23, 64, 0.12);
          border-bottom-width: 2px;
        }

        .im-gen-wrap {
          position: relative;
          flex: 1;
        }

        .im-gen-light {
          position: absolute;
          inset: 10px 8% -10px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c5cff, #3e7bff, #ff5fae);
          filter: blur(22px);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .im-gen-light.active {
          opacity: 0.6;
          animation: imGlowPulse 2.6s ease-in-out infinite;
        }

        .im-gen {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          width: 100%;
          height: 58px;
          padding: 0 28px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 999px;
          overflow: hidden;
          font-size: 17px;
          font-weight: 900;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(
            110deg,
            #6a4df0,
            #3e7bff 45%,
            #ff5fae 90%
          );
          background-size: 200% 100%;
          box-shadow:
            0 16px 36px rgba(100, 80, 240, 0.42),
            inset 0 1px 2px rgba(255, 255, 255, 0.5);
          transition:
            transform 0.3s cubic-bezier(.2,.9,.3,1.25),
            filter 0.3s ease,
            box-shadow 0.3s ease;
        }

        .im-gen::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 40%;
          background: linear-gradient(
            100deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: imShine 3.4s ease-in-out infinite;
          pointer-events: none;
        }

        .im-gen:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.015);
          background-position: 100% 0;
          filter: brightness(1.06);
        }

        .im-gen:active:not(:disabled) {
          transform: scale(0.97);
        }

        .im-gen:disabled {
          cursor: not-allowed;
          filter: grayscale(0.55);
          opacity: 0.55;
          box-shadow: none;
        }

        .im-gen:disabled::after {
          display: none;
        }

        .im-gen-icon {
          display: grid;
          place-items: center;
          width: 21px;
          height: 21px;
          transition: transform 0.6s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-gen-icon svg {
          width: 100%;
          height: 100%;
        }

        .im-gen:hover:not(:disabled) .im-gen-icon {
          transform: rotate(180deg) scale(1.2);
        }

        .im-spinner {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2.5px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          animation: imSpin 0.8s linear infinite;
        }

        .im-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.9;
          color: #a8202c;
          background: rgba(255, 235, 238, 0.88);
          border: 1px solid rgba(220, 70, 85, 0.3);
          animation: imRise 0.5s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-error span {
          display: grid;
          place-items: center;
          flex: 0 0 22px;
          height: 22px;
          margin-top: 3px;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 900;
          color: #fff;
          background: #e5484d;
        }

        /* =====================================================
           STAGE
        ===================================================== */

        .im-stage {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .im-stage-card,
        .im-empty,
        .im-result {
          width: 100%;
          max-width: 560px;
          margin-inline: auto;
        }

        .im-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 30px;
          overflow: hidden;
          background: #d9d0ff;
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 30px 70px rgba(70, 55, 190, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .im-diffusion {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .im-corners i {
          position: absolute;
          width: 26px;
          height: 26px;
          border: 3px solid rgba(255, 255, 255, 0.95);
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          animation: imCorner 2.4s ease-in-out infinite;
        }

        .im-corners i:nth-child(1) { top: 16px; right: 16px; border-left: 0; border-bottom: 0; border-top-right-radius: 10px; }
        .im-corners i:nth-child(2) { top: 16px; left: 16px; border-right: 0; border-bottom: 0; border-top-left-radius: 10px; }
        .im-corners i:nth-child(3) { bottom: 16px; right: 16px; border-left: 0; border-top: 0; border-bottom-right-radius: 10px; }
        .im-corners i:nth-child(4) { bottom: 16px; left: 16px; border-right: 0; border-top: 0; border-bottom-left-radius: 10px; }

        .im-words {
          position: absolute;
          inset: 0;
          --R: min(36vw, 170px);
          pointer-events: none;
        }

        .im-words span {
          position: absolute;
          left: 50%;
          top: 50%;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
          color: var(--ink);
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 8px 20px rgba(80, 60, 200, 0.28);
          opacity: 0;
          animation: imWord 5.6s cubic-bezier(.5, 0, .3, 1) var(--wd) infinite;
        }

        .im-core {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
        }

        .im-core i {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 0 30px rgba(255, 255, 255, 0.8),
            inset 0 0 20px rgba(255, 255, 255, 0.6);
          animation: imCore 2.2s ease-out infinite;
        }

        .im-stage-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          text-align: center;
        }

        .im-stage-label {
          font-size: 19px;
          font-weight: 900;
          background: linear-gradient(90deg, #5b3df0, #2f7bff, #ff5fae);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: imFlip 0.55s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-stage-dots {
          display: flex;
          gap: 7px;
        }

        .im-stage-dots i {
          width: 26px;
          height: 6px;
          border-radius: 999px;
          background: rgba(27, 23, 64, 0.14);
          transition:
            background 0.5s ease,
            box-shadow 0.5s ease;
        }

        .im-stage-dots i.on {
          background: linear-gradient(90deg, #7c5cff, #ff5fae);
          box-shadow: 0 0 12px rgba(124, 92, 255, 0.55);
        }

        .im-stage-sub {
          font-size: 14px;
          line-height: 1.9;
          color: var(--muted);
        }

        /* empty */

        .im-empty {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .im-empty-label {
          position: absolute;
          left: 50%;
          bottom: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 70%;
          padding: 12px 18px;
          border-radius: 20px;
          text-align: center;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow: 0 14px 34px rgba(70, 55, 190, 0.2);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
        }

        .im-empty-label b {
          font-size: 16px;
          font-weight: 900;
        }

        .im-empty-label span {
          font-size: 13px;
          color: var(--muted);
        }

        .im-ideas-title {
          display: block;
          margin-bottom: 10px;
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(27, 23, 64, 0.55);
        }

        .im-ideas-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .im-idea {
          max-width: 100%;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.8;
          text-align: start;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.74);
          box-shadow: 0 8px 20px rgba(80, 60, 200, 0.1);
          transition:
            transform 0.25s cubic-bezier(.2,.9,.3,1.25),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-idea:hover:not(:disabled) {
          transform: translateY(-3px);
          border-color: rgba(124, 92, 255, 0.55);
          box-shadow: 0 14px 30px rgba(80, 60, 200, 0.2);
        }

        /* result */

        .im-result {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .im-card {
          --rx: 0deg;
          --ry: 0deg;
          --gx: 50%;
          --gy: 30%;
          position: relative;
          transform: perspective(1000px) rotateY(var(--rx)) rotateX(var(--ry));
          transition: transform 0.35s cubic-bezier(.2,.8,.2,1);
        }

        .im-card-inner {
          position: relative;
          border-radius: 30px;
          overflow: hidden;
          background: #d9d0ff;
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 34px 80px rgba(70, 55, 190, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .im-card-inner img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 82vh;
          object-fit: contain;
          cursor: zoom-in;
        }

        .im-gloss {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            420px circle at var(--gx) var(--gy),
            rgba(255, 255, 255, 0.34),
            transparent 60%
          );
          transition: opacity 0.3s ease;
        }

        .im-card:hover .im-gloss {
          opacity: 1;
        }

        .im-flash {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            circle at 50% 50%,
            #fff,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 80%
          );
        }

        .im-expand {
          position: absolute;
          top: 14px;
          left: 14px;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-radius: 14px;
          color: var(--ink);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 10px 24px rgba(40, 30, 120, 0.25);
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
          transition: transform 0.25s cubic-bezier(.2,.9,.3,1.25);
        }

        .im-expand svg {
          width: 20px;
          height: 20px;
        }

        .im-expand:hover {
          transform: scale(1.1);
        }

        .im-card.reveal .im-card-inner img {
          animation: imDevelop 1.4s cubic-bezier(.2,.8,.2,1) both;
        }

        .im-card.reveal .im-flash {
          animation: imFlash 1.2s ease-out both;
        }

        .im-burst {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .im-burst i {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          margin: -4.5px;
          border-radius: 50%;
          opacity: 0;
          background: linear-gradient(135deg, #fff, #ffc8ec);
          box-shadow:
            0 0 12px rgba(255, 255, 255, 0.95),
            0 0 24px rgba(160, 120, 255, 0.7);
        }

        .im-card.reveal .im-burst i {
          animation: imBurst 1.3s cubic-bezier(.2,.8,.3,1) 0.15s both;
        }

        .im-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          animation: imRise 0.8s cubic-bezier(.2,.8,.2,1) 0.5s both;
        }

        .im-action {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 24px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 26px rgba(80, 60, 200, 0.14);
          transition:
            transform 0.28s cubic-bezier(.2,.9,.3,1.25),
            box-shadow 0.28s ease;
        }

        .im-action svg {
          width: 19px;
          height: 19px;
        }

        .im-action:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(80, 60, 200, 0.24);
        }

        .im-action:active:not(:disabled) {
          transform: scale(0.96);
        }

        .im-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .im-action.primary {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.5);
          background: linear-gradient(135deg, #6a4df0, #3e7bff);
          box-shadow: 0 16px 34px rgba(100, 80, 240, 0.42);
        }

        /* gallery */

        .im-gallery {
          width: 100%;
          max-width: 560px;
          margin-inline: auto;
        }

        .im-gallery-row {
          display: flex;
          gap: 10px;
          padding: 4px 4px 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .im-gallery-row::-webkit-scrollbar {
          display: none;
        }

        .im-thumb {
          flex: 0 0 auto;
          width: 66px;
          height: 66px;
          padding: 0;
          border: 2px solid rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          background: #d9d0ff;
          box-shadow: 0 10px 22px rgba(80, 60, 200, 0.18);
          transition:
            transform 0.28s cubic-bezier(.2,.9,.3,1.25),
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .im-thumb img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .im-thumb:hover {
          transform: translateY(-3px);
        }

        .im-thumb.on {
          border-color: #7c5cff;
          box-shadow:
            0 0 0 3px rgba(124, 92, 255, 0.28),
            0 12px 26px rgba(100, 80, 240, 0.4);
          transform: scale(1.06);
        }

        /* footer */

        .im-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 44px;
          direction: ltr;
          font-family: "Sora", sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: rgba(27, 23, 64, 0.48);
        }

        .im-footer-serif {
          font-family: "Instrument Serif", Georgia, serif;
          font-style: italic;
          font-size: 19px;
          letter-spacing: 0;
          color: rgba(27, 23, 64, 0.62);
        }

        .im-footer i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--violet);
        }

        /* lightbox */

        .im-lightbox {
          position: fixed;
          inset: 0;
          z-index: 400;
          display: grid;
          place-items: center;
          padding: 20px;
          cursor: zoom-out;
          background: rgba(20, 14, 60, 0.8);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          animation: imFade 0.3s ease both;
        }

        .im-lightbox img {
          max-width: min(94vw, 1100px);
          max-height: 88vh;
          border-radius: 22px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: imZoomIn 0.45s cubic-bezier(.2,.9,.3,1.1) both;
        }

        .im-lightbox-close {
          position: absolute;
          top: calc(18px + env(safe-area-inset-top));
          left: 18px;
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.18);
        }

        .im-lightbox-close svg {
          width: 22px;
          height: 22px;
        }

        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes imRise {
          from {
            opacity: 0;
            transform: translateY(26px);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: none;
            filter: blur(0);
          }
        }

        @keyframes imDrop {
          from {
            opacity: 0;
            transform: translateY(-24px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes imSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes imGradText {
          from {
            background-position: 0% 50%;
          }

          to {
            background-position: 220% 50%;
          }
        }

        @keyframes imDriftA {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(50px, 40px);
          }
        }

        @keyframes imDriftB {
          from {
            transform: translate(0, 0);
          }

          to {
            transform: translate(-50px, -40px);
          }
        }

        @keyframes imTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes imPulseDot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }

        @keyframes imGlowPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.75;
            transform: scale(1.04);
          }
        }

        @keyframes imShine {
          0% {
            inset-inline-start: -50%;
          }

          60%,
          100% {
            inset-inline-start: 130%;
          }
        }

        @keyframes imCorner {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes imCore {
          0% {
            opacity: 0.9;
            transform: scale(0.45);
          }

          100% {
            opacity: 0;
            transform: scale(2.6);
          }
        }

        @keyframes imWord {
          0% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              translate(
                calc(var(--R) * var(--cx)),
                calc(var(--R) * var(--cy))
              )
              scale(1);
          }

          12% {
            opacity: 1;
          }

          70% {
            opacity: 0.95;
          }

          100% {
            opacity: 0;
            filter: blur(5px);
            transform:
              translate(-50%, -50%)
              translate(0px, 0px)
              scale(0.15);
          }
        }

        @keyframes imFlip {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes imDevelop {
          0% {
            -webkit-clip-path: circle(0% at 50% 50%);
            clip-path: circle(0% at 50% 50%);
            filter: blur(24px) saturate(1.7) brightness(1.3);
            transform: scale(1.08);
          }

          55% {
            filter: blur(7px) saturate(1.25) brightness(1.1);
          }

          100% {
            -webkit-clip-path: circle(150% at 50% 50%);
            clip-path: circle(150% at 50% 50%);
            filter: none;
            transform: none;
          }
        }

        @keyframes imFlash {
          0% {
            opacity: 0.95;
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes imBurst {
          0% {
            opacity: 0;
            transform: rotate(var(--ba)) translateX(0) scale(0.2);
          }

          18% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform:
              rotate(var(--ba))
              translateX(var(--bd))
              scale(var(--bs));
          }
        }

        @keyframes imFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes imZoomIn {
          from {
            opacity: 0;
            transform: scale(0.88);
          }

          to {
            opacity: 1;
            transform: none;
          }
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (min-width: 960px) {
          .im-wrap {
            padding-top: 112px;
          }

          .im-grid-layout {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
            gap: 30px;
          }

          .im-studio {
            padding: 26px;
          }

          .im-styles-row {
            margin: 0 -26px;
            padding-inline: 26px;
          }

          .im-hint-keys {
            display: inline-flex;
          }

          .im-gen-wrap {
            flex: 0 1 270px;
          }

          .im-stage {
            position: sticky;
            top: 92px;
          }
        }

        @media (max-width: 520px) {
          .im-wrap {
            padding-inline: 14px;
          }

          .im-studio {
            padding: 16px;
          }

          .im-styles-row {
            margin: 0 -16px;
            padding-inline: 16px;
          }

          .im-gen {
            height: 56px;
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .im-root *,
          .im-root *::before,
          .im-root *::after {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
