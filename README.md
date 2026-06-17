# The Trapped Knight

A simulation of the Trapped Knight problem on an infinite, spiral-numbered chessboard.

Starting from square 1, a knight always jumps to the lowest-numbered square it can legally reach that it has not visited yet. Following this greedy rule, it eventually runs out of unvisited squares within reach and becomes trapped. This project plays that process out and visualizes the path.

## The idea

Number the squares of an infinite board in an outward spiral (1 at the center, then 2, 3, 4, and so on). A knight moves in the usual L-shape. At every step it looks at all eight possible moves, ignores any square it has already landed on, and goes to the smallest-numbered square that remains. The sequence is finite: the knight gets trapped after 2,016 moves, on square 2,084.

## What it shows

- The spiral numbering of the board
- The knight's full path from square 1 until it is trapped
- The final trapped position

## Running it

Open index.html in any browser. Built with JavaScript, no dependencies.
