const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User already exists" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todos } = user;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  Object.assign(findTodo, {
    title,
    deadline,
  });

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return findTodo;
    }

    return todo;
  });

  return response.status(200).json(findTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  Object.assign(findTodo, {
    done: true,
  });

  user.todos = user.todos.map((todo) => {
    if (todo.id === id) {
      return findTodo;
    }

    return todo;
  });

  return response.status(200).json(findTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(findTodo, 1);

  return response.status(204).send();
});

module.exports = app;
