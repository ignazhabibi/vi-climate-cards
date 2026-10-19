// vi-hydraulic-card: hydraulic schematic of the Vitocal 250-A with live values.
import { assets } from "../assets";
import { ViCard } from "../card/base-card";
import { HYDRAULIC_SLOTS } from "./slots";

export class ViHydraulicCard extends ViCard {
  static override slots = HYDRAULIC_SLOTS;
  static override presets = ["vitocal-250a-buffer"];

  static override get layouts() {
    return assets().hydraulic;
  }

  static override get info() {
    return assets().hydraulicInfo;
  }

  // The water lines make sense while water flows.
  protected _infoLive(): boolean {
    return this._num("volumetric_flow") > 0;
  }

  getCardSize(): number {
    return 14;
  }

  protected _apply(): void {
    const root = this._root as HTMLElement;
    const flowing = this._num("volumetric_flow") > 0;
    const valve = this._state("valve")?.state;
    const defrost = this._state("defrost")?.state === "on";
    const on = new Set<string>();
    let angle = 0;
    let mixed = false;
    // Valve states are the integration's enum values; the odd spellings are
    // the real API values.
    if (valve === "domestic_hot_water") angle = 90;
    else if (valve === "climat_circuit_two_defrost") angle = 180;
    else if (valve === "climat_circuit_one_and_two") mixed = true;
    if (flowing) {
      on.add("all");
      if (valve === "climate_circuit_one") for (const g of ["heat", "heatdhw"]) on.add(g);
      else if (valve === "domestic_hot_water") for (const g of ["dhw", "heatdhw"]) on.add(g);
      else if (valve === "climat_circuit_two_defrost") on.add("byp");
      else if (mixed) for (const g of ["heat", "heatdhw", "byp"]) on.add(g);
    }
    if (this._state("circuit_pump")?.state === "on") on.add("hc");
    if (this._state("circulation_pump")?.state === "on") on.add("circ");
    for (const p of this._pipes) p.classList.toggle("on", on.has(p.dataset.g as string));
    for (const p of this._ptrs) p.style.transform = `rotate(${angle}deg)`;

    // Each fan follows its own speed; without a fan entity it follows fan 1,
    // and without that the compressor. Both stop during defrost.
    const entities = this._entities;
    const comp = this._state("compressor")?.state === "on";
    let anyFan = false;
    for (const f of this._fans) {
      const k = entities[f.dataset.k as string] ? (f.dataset.k as string) : "fan";
      const speed = entities[k] ? this._num(k) : comp ? 60 : 0;
      const spin = !defrost && speed > 0;
      anyFan ||= spin;
      f.classList.toggle("spin", spin);
      f.style.setProperty("--fan-dur", this._fanDur(speed));
    }
    root.classList.toggle("run", anyFan);
    // A pump symbol fills while the pump runs; the internal pump reports %.
    for (const p of this._pumps) {
      const s = this._state(p.dataset.k as string)?.state;
      const pct = parseFloat(s as string);
      p.classList.toggle("on", Number.isFinite(pct) ? pct > 0 : s === "on");
    }
    root.classList.toggle("defrost", defrost);
    root.classList.toggle("mixed", mixed);
    root.classList.toggle("on-comp", comp);
  }
}
