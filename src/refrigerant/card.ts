// vi-refrigerant-card: refrigerant circuit of the Vitocal 250-A with live values.
import { assets } from "../assets";
import { ViCard } from "../card/base-card";

export class ViRefrigerantCard extends ViCard {
  static override required = ["compressor"];

  static override get layouts() {
    return assets().refrigerant;
  }

  static override get info() {
    return assets().refrigerantInfo;
  }

  getCardSize(): number {
    return 9;
  }

  protected _apply(): void {
    const root = this._root as HTMLElement;
    const running = this._running();
    const defrost = this._state("defrost")?.state === "on";
    // Heating sends the hot gas to the condenser; valve 2 expands the liquid
    // into the evaporator. Defrost reverses the cycle through the 4-way valve:
    // the evaporator condenses, valve 1 expands into the condenser, and the
    // flow runs backwards through both valves and the internal heat
    // exchanger. Pipe groups are listed in layouts.ts. In defrost the water
    // gives heat, so the return is the warm side.
    const warm = new Set(defrost ? ["d", "e", "l2b", "l2a", "l1b", "wr"] : ["d", "c", "l1a", "l1b", "l2a", "wv"]);
    const reverse = new Set(defrost ? ["e", "c", "l1a", "l1b", "l2a", "l2b"] : []);
    // Refrigerant state per group: liquid from the condensing heat exchanger
    // to the expanding valve, a two-phase mix behind that valve, gas
    // everywhere else. In defrost the evaporator condenses and valve 1
    // expands, so liquid and mix swap sides.
    const phase: Record<string, string> = defrost
      ? { l2b: "liq", l2a: "liq", l1b: "liq", l1a: "mix" }
      : { l1a: "liq", l1b: "liq", l2a: "liq", l2b: "mix" };
    for (const p of this._pipes) {
      const g = p.dataset.g as string;
      const water = g === "wv" || g === "wr";
      p.classList.toggle("on", water ? this._num("volumetric_flow") > 0 || running : running);
      if (p.classList.contains("pipe")) {
        p.classList.toggle("s", warm.has(g));
        p.classList.toggle("r", !warm.has(g));
      } else {
        p.classList.toggle("rev", reverse.has(g));
        const ph = water ? "" : phase[g] || "gas";
        for (const c of ["liq", "mix", "gas"]) p.classList.toggle(c, ph === c);
      }
    }
    for (const f of this._fans) {
      const speed = this._num(f.dataset.k as string);
      f.classList.toggle("spin", speed > 0);
      f.style.setProperty("--fan-dur", this._fanDur(speed));
    }
    root.classList.toggle("defrost", defrost);
    root.classList.toggle("on-comp", running);
  }
}
