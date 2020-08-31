// Constants
const numRows: number = 20;
const cellSize: number = 800 / numRows; // 600 represents the width/height of the canvas element
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

// Nodes
let startingNode: number[] = [
  Math.floor(Math.random() * numRows),
  Math.floor(Math.random() * numRows),
];
let finishNode: number[] = [
  Math.floor(Math.random() * numRows),
  Math.floor(Math.random() * numRows),
];

// Interface for the 'cell' object
interface Cell {
  row: number;
  col: number;
  distance: number;
  isVisited: boolean;
  isWall: boolean;
  previousNode: any; // Null
}

// Generate Random 2d Array to represent the grid
function createRandomGrid() {
  const grid: Array<Array<Cell>> = new Array(numRows);

  for (let i = 0; i < numRows; i += 1) {
    grid[i] = new Array(numRows);

    for (let j = 0; j < numRows; j += 1) {
      grid[i][j] = {
        row: i,
        col: j,
        distance: Infinity,
        isVisited: false,
        isWall: Math.random() < 0.2 ? true : false,
        previousNode: null,
      };
    }
  }

  // This makes sure that the starting & finish node are not walls
  grid[startingNode[0]][startingNode[1]].isWall = false;
  grid[finishNode[0]][finishNode[1]].isWall = false;

  return grid;
}

// Render the Grid to the canvas
function drawGrid(context: CanvasRenderingContext2D, grid: Array<Array<Cell>>) {
  // Define Grid Styles
  context.strokeStyle = 'black';
  context.fillStyle = 'grey';

  for (let i = 0; i < grid.length; i += 1) {
    for (let j = 0; j < grid.length; j += 1) {
      const value: boolean = grid[i][j].isWall;

      // Determine the color of each grid cell
      switch (value) {
        case true:
          context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          break;
        default:
          context.clearRect(i * cellSize, j * cellSize, cellSize, cellSize);
          break;
      }

      context.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  // Draw Start
  context.fillStyle = 'green';
  context.fillRect(
    startingNode[0] * cellSize,
    startingNode[1] * cellSize,
    cellSize,
    cellSize
  );

  // Draw End
  context.fillStyle = 'red';
  context.fillRect(
    finishNode[0] * cellSize,
    finishNode[1] * cellSize,
    cellSize,
    cellSize
  );
}

// Handle Left Click to Set the Start
canvas.addEventListener('click', (e) => setStart(ctx, masterGrid, e));

// Handle Left Click to Set the Start
canvas.addEventListener('contextmenu', (e) => setFinish(ctx, masterGrid, e));

// Set Start Logic
function setStart(
  context: CanvasRenderingContext2D,
  grid: Array<Array<Cell>>,
  e: MouseEvent
) {
  let cellX: number = Math.floor(
    (e.clientX - canvas.offsetLeft) / (800 / numRows)
  );

  let cellY: number = Math.floor(
    (e.clientY - canvas.offsetTop) / (800 / numRows)
  );

  startingNode = [cellX, cellY];
  grid[cellX][cellY].isWall = false;

  drawGrid(context, grid);
}

// Set Finishing Node Logic
function setFinish(
  context: CanvasRenderingContext2D,
  grid: Array<Array<Cell>>,
  e: MouseEvent
) {
  e.preventDefault();
  let cellX: number = Math.floor(
    (e.clientX - canvas.offsetLeft) / (800 / numRows)
  );

  let cellY: number = Math.floor(
    (e.clientY - canvas.offsetTop) / (800 / numRows)
  );

  finishNode = [cellX, cellY];
  grid[cellX][cellY].isWall = false;

  drawGrid(context, grid);
}

// Dijkstra's Algorithm
function dijkstra(grid: Array<Array<Cell>>, startNode: Cell, finishNode: Cell) {
  const visitedNodesInOrder: Array<Cell> = [];

  startNode.distance = 0;

  // At the start, every one will be unvisited
  const unvisitedNodes = getAllNodes(grid);

  // The '!!' is basically saying just displaying the true boolean value of the length
  // So this will run the while loop until the unvisitedNodes array is empty, in which case it will return fasle and the loop will end
  while (!!unvisitedNodes.length) {
    // Sort nodes by distance
    sortNodesByDistance(unvisitedNodes);
    // The first node in the unvistedNode array is the closest
    const closestNode: Cell | any = unvisitedNodes.shift();
    // If its a wall skip it
    if (closestNode.isWall) continue;

    if (closestNode.distance === Infinity) return visitedNodesInOrder;
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === finishNode) return visitedNodesInOrder;

    updateUnvisitedNeighbors(closestNode, grid);
  }
}

// Creates an array of every node in a grid
function getAllNodes(grid: Array<Array<Cell>>) {
  const nodes: Array<Cell> = [];

  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

// Sort the nodes by distance
function sortNodesByDistance(unvisitedNodes: Array<Cell>) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

// Get all the neighbors we haven't visited
function updateUnvisitedNeighbors(node: Cell, grid: Array<Array<Cell>>) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);

  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node: Cell, grid: Array<Array<Cell>>) {
  const neighbors = [];

  const { col, row } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

// Find the shortest path
function getShortestPath(finishNode: Cell) {
  const nodesInShortestPath = [];

  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPath.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  drawGrid(ctx, masterGrid);

  return nodesInShortestPath;
}

function drawDijkstra(
  visitedNodesInOrder: Array<Cell>,
  nodesInShortestPath: Array<Cell>
) {
  for (let i = 0; i <= visitedNodesInOrder.length; i += 1) {
    if (i === visitedNodesInOrder.length) {
      setTimeout(() => {
        drawShortestPath(nodesInShortestPath);
      }, 30 * i);
      return;
    }

    setTimeout(() => {
      const node = visitedNodesInOrder[i];

      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'lightblue';
      // Draw the Search
      ctx.fillRect(
        node.row * cellSize,
        node.col * cellSize,
        cellSize,
        cellSize
      );

      // Draw Start
      ctx.fillStyle = 'green';
      ctx.fillRect(
        startingNode[0] * cellSize,
        startingNode[1] * cellSize,
        cellSize,
        cellSize
      );

      // Draw End
      ctx.fillStyle = 'red';
      ctx.fillRect(
        finishNode[0] * cellSize,
        finishNode[1] * cellSize,
        cellSize,
        cellSize
      );

      ctx.strokeRect(
        node.row * cellSize,
        node.col * cellSize,
        cellSize,
        cellSize
      );
    }, 30 * i);
  }
}

function drawShortestPath(nodesInShortestPath: Array<Cell>) {
  for (let i = 0; i < nodesInShortestPath.length; i += 1) {
    setTimeout(() => {
      const node = nodesInShortestPath[i];
      ctx.fillStyle = 'coral';
      ctx.strokeStyle = 'black';

      ctx.fillRect(
        node.row * cellSize,
        node.col * cellSize,
        cellSize,
        cellSize
      );

      ctx.strokeRect(
        node.row * cellSize,
        node.col * cellSize,
        cellSize,
        cellSize
      );
    }, 30 * i);
  }
}

// UI & Controls
let startBtn = document.querySelector('.start');
let refeshBtn = document.querySelector('.refresh');

refeshBtn?.addEventListener('click', (e) => {
  window.location.reload();
});

function test() {
  const visitedNodesInOrder: any = dijkstra(
    masterGrid,
    masterGrid[startingNode[0]][startingNode[1]],
    masterGrid[finishNode[0]][finishNode[1]]
  );

  const nodesInShortestpath = getShortestPath(
    masterGrid[finishNode[0]][finishNode[1]]
  );

  drawDijkstra(visitedNodesInOrder, nodesInShortestpath);
}

// Initial Draw
let masterGrid: Array<Array<Cell>> = createRandomGrid();
drawGrid(ctx, masterGrid);
