(() => {
  function generateOperationSubsets(operations, k) {
    let result = [];

    function backtrack(start, currentSubset) {
      if (currentSubset.length === k) {
        result.push(currentSubset.slice());
        return;
      }

      for (let i = start; i < operations.length; i++) {
        currentSubset.push(operations[i]);
        backtrack(i, currentSubset);
        currentSubset.pop();
      }
    }

    backtrack(0, []);
    return result;
  }

  function generatePatterns(operationCount) {
    const operations = ["+", "-", "*", "/"];
    let patterns = [];

    for (let i = 1; i <= operationCount; i++) {
      patterns = patterns.concat(generateOperationSubsets(operations, i));
    }

    return patterns;
  }

  const operationCount = 1; // cantidad de operaciones a generar
  const patterns = generatePatterns(operationCount);
  app.logs.print(patterns);

  //############

  function evaluateExpression(start, pattern) {
    let currentValue = start;
    for (const operation of pattern) {
      const operand = Math.floor(Math.random() * 10);

      if (operation === "+") {
        currentValue += operand;
      } else if (operation === "-") {
        currentValue -= operand;
      } else if (operation === "*") {
        currentValue *= operand;
      } else if (operation === "/") {
        currentValue = Math.round(currentValue / Math.max(1, operand));
      }
    }
    return currentValue;
  }

  function generateSequence(pattern, length, start) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
      const value = evaluateExpression(start, pattern);
      sequence.push(value);
      start = value;
    }
    return sequence;
  }

  //########

  function generatePuzzles(start, maxNumber, patterns) {
    let puzzles = [];

    for (let i = start; i <= maxNumber; i++) {
      for (const pattern of patterns) {
        const sequence = generateSequence(pattern, 5, i);
        puzzles.push({
          puzzle: sequence.slice(0, -1),
          answer: sequence[sequence.length - 1],
        });
      }
    }

    return puzzles;
  }

  const maxNumber = 5; // El número máximo que se utilizará en las secuencias
  const puzzles = generatePuzzles(1, maxNumber, patterns);
  app.logs.print(puzzles);
})();
