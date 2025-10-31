import 'package:flutter/material.dart';

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  // Board representation: 0 empty, 1 player (X), -1 AI (O)
  List<int> board = List<int>.filled(9, 0);
  bool playerTurn = true; // Player starts
  String status = 'Your turn';
  bool gameOver = false;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Tic Tac Toe')),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [scheme.primary.withOpacity(0.08), Colors.transparent],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  status,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 16),
                AspectRatio(
                  aspectRatio: 1,
                  child: _buildBoard(scheme),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _reset,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Reset'),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: gameOver || !playerTurn ? null : _aiMove,
                      icon: const Icon(Icons.smart_toy),
                      label: const Text('AI Move'),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBoard(ColorScheme scheme) {
    return Container(
      decoration: BoxDecoration(
        color: scheme.surface.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.primary.withOpacity(0.2)),
      ),
      padding: const EdgeInsets.all(8),
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
        ),
        itemCount: 9,
        itemBuilder: (context, index) => _buildCell(index, scheme),
      ),
    );
  }

  Widget _buildCell(int index, ColorScheme scheme) {
    final mark = board[index];
    final display = mark == 1
        ? 'X'
        : mark == -1
            ? 'O'
            : '';
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () {
        if (gameOver || !playerTurn || board[index] != 0) return;
        setState(() {
          board[index] = 1;
          playerTurn = false;
        });
        _evaluate();
        if (!gameOver) {
          Future.delayed(const Duration(milliseconds: 350), _aiMove);
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: scheme.secondaryContainer.withOpacity(0.25),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: AnimatedScale(
            duration: const Duration(milliseconds: 160),
            scale: display.isEmpty ? 0.9 : 1.0,
            child: Text(
              display,
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w800,
                color: mark == 1 ? scheme.primary : scheme.tertiary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _reset() {
    setState(() {
      board = List<int>.filled(9, 0);
      playerTurn = true;
      status = 'Your turn';
      gameOver = false;
    });
  }

  void _aiMove() {
    if (gameOver) return;
    final move = _bestMove(board);
    if (move != -1) {
      setState(() {
        board[move] = -1;
      });
    }
    _evaluate();
    if (!gameOver) {
      setState(() => playerTurn = true);
      setState(() => status = 'Your turn');
    }
  }

  void _evaluate() {
    final winner = _checkWinner(board);
    if (winner == 1) {
      setState(() {
        status = 'You win!';
        gameOver = true;
      });
    } else if (winner == -1) {
      setState(() {
        status = 'AI wins!';
        gameOver = true;
      });
    } else if (!board.contains(0)) {
      setState(() {
        status = 'Draw!';
        gameOver = true;
      });
    } else {
      // continue
    }
  }

  int _bestMove(List<int> b) {
    // Try to win
    for (int i = 0; i < 9; i++) {
      if (b[i] == 0) {
        b[i] = -1;
        if (_checkWinner(b) == -1) {
          b[i] = 0;
          return i;
        }
        b[i] = 0;
      }
    }
    // Block player win
    for (int i = 0; i < 9; i++) {
      if (b[i] == 0) {
        b[i] = 1;
        if (_checkWinner(b) == 1) {
          b[i] = 0;
          return i;
        }
        b[i] = 0;
      }
    }
    // Take center
    if (b[4] == 0) return 4;
    // Take a corner
    const corners = [0, 2, 6, 8];
    for (final c in corners) {
      if (b[c] == 0) return c;
    }
    // Take any side
    const sides = [1, 3, 5, 7];
    for (final s in sides) {
      if (b[s] == 0) return s;
    }
    return -1;
  }

  int _checkWinner(List<int> b) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (final l in lines) {
      final s = b[l[0]] + b[l[1]] + b[l[2]];
      if (s == 3) return 1;
      if (s == -3) return -1;
    }
    return 0;
  }
}
