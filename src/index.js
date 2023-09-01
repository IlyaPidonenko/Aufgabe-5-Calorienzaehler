import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

// allows using html tags as functions in javascript
const { div, button, p, h1, input, table, tr, td, th } = hh(h);

// A combination of Tailwind classes which represent a (more or less nice) button style
const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

// Messages which can be used to update the model
const MSGS = {
  UPDATE_LIST: "UPDATE_LIST",
  UPDATE_COUNTER_MINUS: "UPDATE_COUNTER_MINUS",
  UPDATE_INPUT_EATS: "UPDATE_INPUT_EATS",
  UPDATE_INPUT_CALORIES: "UPDATE_INPUT_CALORIES",

  // ... ℹ️ additional messages
};

// View function which represents the UI as HTML-tag functions
function view(dispatch, model) {

  const totalCalories = model.rows.reduce((acc, row) => {
    const calories = parseFloat(row[1]); 
    if (!isNaN(calories)) {
      return acc + calories;
    }
    return acc;
  }, 0);
  
  return div({ className: "flex flex-col gap-4 items-center" }, [
    // counter
    h1({ className: "text-2xl" }, `Kalorienzähler`),
    
    div({className: "flex gap-4"}, [
      input({
        type: 'text',
        className: "border rounded py-2 px-3",
        value: model.eatsInputValue,
        oninput: (event) => {
          model.eatsInputValue = event.target.value;
          dispatch(MSGS.UPDATE_INPUT_EATS, event.target.value);
        },
      }),
      input({
        type: 'text',
        value: model.caloriesInputValue,
        className: "border rounded py-2 px-3",
        oninput: (event) => {
          model.caloriesInputValue = event.target.value;
          dispatch(MSGS.UPDATE_INPUT_CALORIES, event.target.value);
        },
      }),
      button({ className: btnStyle, onclick: () => dispatch(MSGS.UPDATE_LIST) }, "Hinzufügen"),
    ]),
    table({ className: "border-collapse border" }, [
      tr([
        th({ className: "border py-2 px-28" }, "Meal:"),
        th({ className: "border py-2 px-28" }, "Calories:"),
      ]),
      ...model.rows.map(row => (
        tr([
          td({ className: "border py-2 px-28" }, row[0]), 
          td({ className: "border py-2 px-28" }, row[1]), 
        ])
      ))
    ]),
    p({ className: "text-2xl" }, `Total: ${totalCalories} Calories`),
  ]);
}


// Update function which takes a message and a model and returns a new/updated model
function update(msg, model) {
  switch (msg) {
    case MSGS.UPDATE_LIST:
      if (model.eatsInputValue && model.caloriesInputValue) {
        const newRow = [
          model.eatsInputValue,
          model.caloriesInputValue,
        ];

        const updatedRows = [...model.rows, newRow];
        const updatedModel = {
          ...model,
          meal: model.eatsInputValue, 
          calories: model.caloriesInputValue, 
          rows: updatedRows,
        };

        return updatedModel;
      } else {
        return model;
      }

    default:
      return model;
  }
}

// ⚠️ Impure code below (not avoidable but controllable)
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

// The initial model when the app starts
const initModel = {
  counter: 0,
  eatsInputValue: "",
  caloriesInputValue: "",
  meal: "",
  calories: "",
  rows: [], 
};

// The root node of the app (the div with id="app" in index.html)
const rootNode = document.getElementById("app");

// Start the app
app(initModel, update, view, rootNode);