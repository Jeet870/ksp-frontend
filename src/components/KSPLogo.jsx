import kspLogoImg from "../assets/ksp-logo.png";

export default function KSPLogo({ size = 64 }) {
  return (
    <img
      src={kspLogoImg}
      alt="Karnataka State Police"
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        filter: "drop-shadow(0 2px 8px rgba(201,168,76,0.3))",
      }}
    />
  );
}
