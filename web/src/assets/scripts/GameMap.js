import { AcGameObject } from "./AcGameObject";
import { Wall } from "./Wall";

export class GameMap extends AcGameObject {
  constructor(ctx, parent) {
    super();

    this.ctx = ctx;
    this.parent = parent;
    // L: 每个小正方形的边长，由浏览器窗口大小决定
    this.L = 0;

    this.rows = 13;
    this.cols = 13;

    this.inner_walls_count = 20;
    this.walls = [];
  }

  check_connectivity(g, sx, sy, tx, ty) {
    // flood fill算法，检查从(sx, sy)到(tx, ty)是否连通
    // 如果走到了(tx, ty)，返回true
    if (sx == tx && sy == ty) return true;
    // 将当前(sx, sy)标记为已经走过
    g[sx][sy] = true;
    // 定义四个方向的偏移量
    let dx = [-1, 0, 1, 0],
      dy = [0, 1, 0, -1];
    // 依次尝试四个方向
    for (let i = 0; i < 4; i++) {
      let x = sx + dx[i],
        y = sy + dy[i];
      // 如果(x, y)不是障碍物，且没有走过，递归调用
      // 如果走到了(tx, ty)，返回true
      if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty)) return true;
    }

    return false;
  }

  create_walls() {
    // 创建一个二维布尔数组，表示是否有障碍物，初始值为false
    const g = [];
    for (let r = 0; r < this.rows; r++) {
      g[r] = [];
      for (let c = 0; c < this.cols; c++) {
        g[r][c] = false;
      }
    }

    // 给四周加上障碍物
    for (let r = 0; r < this.rows; r++) {
      g[r][0] = g[r][this.cols - 1] = true;
    }

    for (let c = 0; c < this.cols; c++) {
      g[0][c] = g[this.rows - 1][c] = true;
    }

    // 创建随机障碍物
    // 因为要轴对称，所以只生成一半，然后对称复制
    for (let i = 0; i < this.inner_walls_count / 2; i++) {
      // 如果随机生成的位置已经有障碍物了，就重新生成
      for (let j = 0; j < 1000; j++) {
        let r = parseInt(Math.random() * this.rows);
        let c = parseInt(Math.random() * this.cols);
        if (g[r][c] || g[c][r]) continue;
        // 如果随机生成的位置是左下角或者右上角，就重新生成
        if ((r == this.rows - 2 && c == 1) || (r == 1 && c == this.cols - 2))
          continue;

        g[r][c] = g[c][r] = true;
        break;
      }
    }

    // 检查是否连通。如果不连通，返回false，重新生成障碍物
    // 避免污染原布尔数组，复制一份g，然后检查
    const copy_g = JSON.parse(JSON.stringify(g));
    if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2))
      return false;

    // 根据二维布尔数组，把障碍物加入到this.walls数组中
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (g[r][c]) {
          this.walls.push(new Wall(r, c, this));
        }
      }
    }

    return true;
  }

  start() {
    for (let i = 0; i < 1000; i++) if (this.create_walls()) break;
  }

  update_size() {
    // parent的宽高由浏览器的窗口大小决定，所以每次更新时都要重新计算
    // 每个小正方形的边长，在宽高中取最小值
    // 因为canvas是按照整数坐标画正方形，为了避免边界出现空隙，所以要取整
    this.L = parseInt(
      Math.min(
        this.parent.clientWidth / this.cols,
        this.parent.clientHeight / this.rows
      )
    );
    // 由小正方形的边长计算画布的宽高
    this.ctx.canvas.width = this.L * this.cols;
    this.ctx.canvas.height = this.L * this.rows;
  }

  update() {
    this.update_size();
    this.render();
  }

  render() {
    const color_even = "#AAD751",
      color_odd = "#A2D149";
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // 奇偶格子颜色不同
        if ((r + c) % 2 == 0) {
          this.ctx.fillStyle = color_even;
        } else {
          this.ctx.fillStyle = color_odd;
        }
        // canvas画矩形，横着为x，竖着为y
        this.ctx.fillRect(c * this.L, r * this.L, this.L, this.L);
      }
    }
  }
}
