import * as T from './vendor/three.module.js';

// Moves the actual operational scene between desktop and AR; never clones it.
// Kept independent of WebXR/DOM so placement and restoration can be regression-tested.
export class ARPlacement {
  constructor(root, {scale = .004, floorY = 0} = {}) {
    this.root = root;
    this.anchor = new T.Group();
    this.anchor.name = 'AR surface anchor';
    this.content = new T.Group();
    this.content.scale.setScalar(scale);
    this.lift = new T.Group();
    this.lift.position.y = -floorY;
    this.content.add(this.lift);
    this.anchor.add(this.content);
    this.anchor.visible = false;
    this.state = 'idle';
    this.hit = null;
  }
  get placed() { return this.state === 'placed'; }
  begin(scene) {
    if (this.state !== 'idle') return;
    const r = this.root;
    this.saved = {parent:r.parent, index:r.parent?.children.indexOf(r), position:r.position.clone(), quaternion:r.quaternion.clone(), scale:r.scale.clone(), visible:r.visible};
    this.lift.add(r);
    r.position.set(0,0,0); r.quaternion.identity(); r.scale.setScalar(1); r.visible = true;
    scene.add(this.anchor);
    this.state = 'scanning';
    this.anchor.visible = false;
    this.hit = null;
  }
  offerHit(matrix, now) {
    this.hit = null;
    if (this.state !== 'scanning' || !matrix || matrix.length !== 16 || !Array.from(matrix).every(Number.isFinite)) return false;
    // Accept upward, nearly horizontal planes only (within 15 degrees).
    const up = new T.Vector3(matrix[4], matrix[5], matrix[6]).normalize();
    if (up.y < Math.cos(Math.PI / 12)) return false;
    this.hit = {matrix:new T.Matrix4().fromArray(matrix), time:now};
    return true;
  }
  place(now) {
    if (this.state !== 'scanning' || !this.hit || now - this.hit.time > 250 || now < this.hit.time) return false;
    this.anchor.position.setFromMatrixPosition(this.hit.matrix);
    this.anchor.quaternion.setFromRotationMatrix(this.hit.matrix);
    this.anchor.visible = true;
    this.state = 'placed';
    this.hit = null;
    return true;
  }
  reposition() {
    if (this.state === 'idle') return;
    this.state = 'scanning';
    this.anchor.visible = false;
    this.hit = null;
  }
  setScale(value) { this.content.scale.setScalar(T.MathUtils.clamp(value, .002, .012)); }
  end() {
    if (this.state === 'idle') return;
    const s = this.saved, r = this.root;
    if (s.parent) {
      s.parent.add(r);
      s.parent.children.splice(s.parent.children.indexOf(r), 1);
      s.parent.children.splice(s.index, 0, r);
    } else r.removeFromParent();
    r.position.copy(s.position); r.quaternion.copy(s.quaternion); r.scale.copy(s.scale); r.visible = s.visible;
    this.anchor.removeFromParent(); this.anchor.visible = false;
    this.state = 'idle'; this.hit = null; this.saved = null;
    r.updateWorldMatrix(true, true);
  }
}
