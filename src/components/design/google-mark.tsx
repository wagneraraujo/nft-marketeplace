const pieces = [
  ['88a3c.svg', '57.68% 17.83% 0 7.11%'],
  ['75804.svg', '71.33% 17.83% 0 50%'],
  ['a3c98.svg', '24.69% 75.25% 24.69% 0'],
  ['1c266.svg', '38.28% 0 11.97% 47.07%'],
  ['1174b.svg', '38.28% 0 11.97% 50%'],
  ['5f1dc.svg', '0 17.01% 57.68% 7.11%'],
  ['e1073.svg', '0 17.01% 70.51% 50%'],
]
export function GoogleMark() {
  return (
    <span className="google-mark" aria-hidden="true">
      {pieces.map(([file, inset]) => (
        <span key={file} style={{ inset }}>
          <img src={`/figma/${file}`} alt="" />
        </span>
      ))}
    </span>
  )
}
