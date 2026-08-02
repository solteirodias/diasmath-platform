import type { FactorableQuadratic } from "../math/QuadraticFactorization";
import { buildAreaDecomposition } from "../math/AreaDecomposition";

export class FactorRectangleOverlay {
  private factorization: FactorableQuadratic | null = null;

  setFactorization(factorization: FactorableQuadratic | null): void {
    this.factorization = factorization;
  }

  draw(
    context: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (!this.factorization) return;

    const decomposition = buildAreaDecomposition(this.factorization);
    const width = Math.min(320, Math.max(240, canvasWidth * 0.36));
    const height = Math.min(230, Math.max(180, canvasHeight * 0.32));
    const x = canvasWidth - width - 26;
    const y = canvasHeight - height - 26;
    const header = 34;
    const bodyY = y + header;
    const bodyHeight = height - header;
    const splitX = x + width * 0.62;
    const splitY = bodyY + bodyHeight * 0.62;

    context.save();
    context.shadowColor = "rgba(0,0,0,.45)";
    context.shadowBlur = 24;
    context.fillStyle = "rgba(6, 17, 30, .9)";
    roundedRect(context, x, y, width, height, 16);
    context.fill();

    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(108, 214, 255, .55)";
    context.lineWidth = 2;
    roundedRect(context, x, y, width, height, 16);
    context.stroke();

    context.fillStyle = "#dff7ff";
    context.font = "700 13px system-ui";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText("RETÂNGULO DOS FATORES", x + 14, y + header / 2);

    drawCell(
      context,
      x,
      bodyY,
      splitX - x,
      splitY - bodyY,
      decomposition.cells[0].label,
      "#168da7"
    );
    drawCell(
      context,
      splitX,
      bodyY,
      x + width - splitX,
      splitY - bodyY,
      decomposition.cells[1].label,
      "#2d8f47"
    );
    drawCell(
      context,
      x,
      splitY,
      splitX - x,
      bodyY + bodyHeight - splitY,
      decomposition.cells[2].label,
      "#4a9e61"
    );
    drawCell(
      context,
      splitX,
      splitY,
      x + width - splitX,
      bodyY + bodyHeight - splitY,
      decomposition.cells[3].label,
      "#b48112"
    );

    context.strokeStyle = "rgba(255,255,255,.45)";
    context.lineWidth = 1;
    context.strokeRect(x, bodyY, width, bodyHeight);
    context.beginPath();
    context.moveTo(splitX, bodyY);
    context.lineTo(splitX, bodyY + bodyHeight);
    context.moveTo(x, splitY);
    context.lineTo(x + width, splitY);
    context.stroke();

    context.fillStyle = "#9edff6";
    context.font = "700 12px system-ui";
    context.textAlign = "center";
    context.fillText(
      decomposition.widthLabel,
      x + width / 2,
      bodyY + bodyHeight + 16
    );

    context.save();
    context.translate(x - 16, bodyY + bodyHeight / 2);
    context.rotate(-Math.PI / 2);
    context.fillText(decomposition.heightLabel, 0, 0);
    context.restore();

    context.restore();
  }
}

function drawCell(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  color: string
): void {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
  context.fillStyle = "rgba(255,255,255,.95)";
  context.font = "800 16px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, x + width / 2, y + height / 2);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
