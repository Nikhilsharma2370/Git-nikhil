import React from "react";
import { AbsoluteFill } from "remotion";
import { SpeakerLayer } from "./SpeakerLayer";
import { Captions } from "./Captions";
import { OnScreenUI } from "./OnScreenUI";
import { Full1VideoCentric, Full2Spotlight, Full3HighEnd, Half1Shrink, Half2LessIsMore, Half3Harsh } from "./scenes/Scenes";
import { SoundDesign } from "./Sound";

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {/* 1. speaker (voice yahin se aati hai) + dark/blur behind UI */}
    <SpeakerLayer />
    {/* 2. on-screen UI (caption ke neeche) */}
    <OnScreenUI />
    {/* 3. half-screen panels (upar) */}
    <Half1Shrink />
    <Half2LessIsMore />
    <Half3Harsh />
    {/* 4. captions (speaker / speaker-half par) */}
    <Captions />
    {/* 5. full-screen scenes */}
    <Full1VideoCentric />
    <Full2Spotlight />
    <Full3HighEnd />
    {/* 6. sound design */}
    <SoundDesign />
  </AbsoluteFill>
);
