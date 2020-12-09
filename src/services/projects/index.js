const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { S_IFDIR } = require("constants");

const projectsFilePath = path.join(__dirname, "projects.json");
const fileAsString = fs.readFileSync(projectsFilePath).toString();
const projectsArray = JSON.parse(fileAsString);

const readFile = fileName => {
  const buffer = fs.readFileSync(path.join(__dirname, fileName));
  const fileContent = buffer.toString();
  return JSON.parse(fileContent);
};

//   Every project will have this information:
//   - Name
//   - Description
//   - Creation Date
//   - ID
//   - RepoURL -> Code Repo URL (es.: GitHub / BitBucket project URL)
//   - LiveURL -> URL of the "live" project
//   - StudentID

//1. Get All
router.get("/", (req, res) => {
  res.status(200).send(projectsArray);
});

//2. Get specific
router.get("/:id", (req, res, next) => {
  try {
    const projects = readFile("projects.json");
    const project = projects.filter(project => project.id === req.params.id);
    if (project.length > 0) {
      res.send(project);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

//add a new project
router.post(
  "/",

  [
    check("name")
      .isLength({ min: 2 })
      .withMessage("Name must be longer than 2 letters")
      .exists()
      .withMessage("Insert a name please!"),
    check("description")
      .isLength({ min: 100 })
      .withMessage("Description must be longer than 100 characters")
      .exists()
      .withMessage("Insert a description please!"),
   
    check('repoURL').exists()
    .withMessage("Link to your GitHUb repo"),
    ,
    check('liveURL').exists()
    .withMessage("Is your site up & running? Let us check it out with a link"),
    ,
    check('studentId').exists()      
    .withMessage("Insert your student ID to keep all your projects together!"),


  ],
  (req, res, next) => {
    try {
    const errors = validationResult(req)
      const project = readFile("projects.json");
      const buffer = fs.readFileSync(
        path.join(__dirname, "../students/", "students.json")
      );
      const students = JSON.parse(buffer.toString());
      const exists = students.find(
        student => student.id === req.body.studentId
      );

      if (exists.length > 0  && errors.isEmpty()) {

        const newProject = {
            ...req.body,
            createdAt: new Date(),
            projectId: uniqid()
         
         };
 
         project.push(newProject);
         fs.writeFileSync(projectsFilePath, JSON.stringify(projectsArray));
         res.status(201).send(newProject);
       } else {
        const err = new Error();
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      next(error);
      console.log(error);
    }
    
  }
);

router.delete("/:id", (req, res, next) => {
  try {
    const projects = readFile("projects.json");
    const filteredProjects = projects.filter(
      project => project.id !== req.params.id
    );
    fs.writeFileSync(projectsFilePath, JSON.stringify(filteredProjects));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const projects = readFile("users.json");
    const filteredProjects = projects.filter(
      project => project.id !== req.params.id
    );

    const modifiedProject = {
      ...req.body,
      id: req.params.id,
      modifiedAt: new Date(),
    };
    if (modifiedProject.id === req.params.id) {
      filteredProjects.push(modifiedProject);
      fs.writeFileSync(projectsFilePath, JSON.stringify(filteredProjects));
      res.send(projectsArray);
    } else {
      res.status(400).send({ error: "No project found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
