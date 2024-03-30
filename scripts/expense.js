let expenses = [];

processExpenses = (text) => {
    let all = text.split(" ");
    let action = all[0];
    let content = text.substring(action.length + 1);
    switch (action) {
      case ".add" : {
        
        break;
      }
      default: {
        doAddExpense(content);
        showStatus(" add - done", true);
        break;
      }
    }
}

doAddExpense() = (content) => {
}
