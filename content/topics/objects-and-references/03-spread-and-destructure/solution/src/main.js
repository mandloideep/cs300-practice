const student = { name: "Alice", score: 85, major: "Computer Science" };
const scores = [85, 92, 73];

console.log("student:", student);
console.log("scores:", scores);

const curved = { ...student, score: student.score + 5 };
console.log("curved:", curved);
console.log("student after spread:", student);
console.log("Same object?", curved === student);

const moreScores = [...scores, 96];
console.log("moreScores:", moreScores);
console.log("scores after spread:", scores);

const { name, major } = student;
console.log(`${name} studies ${major}`);
const [firstScore, secondScore] = scores;
console.log("first two scores:", firstScore, secondScore);

const advisee = { name: "Bob", advisor: { name: "Lee", office: "Room 204" } };
const copy = { ...advisee };
copy.name = "Robert";
copy.advisor.office = "Room 310";
console.log("advisee:", advisee);
console.log("Same advisor?", copy.advisor === advisee.advisor);

const moved = { ...advisee, advisor: { ...advisee.advisor, office: "Room 118" } };
console.log("moved:", moved.advisor.office, "advisee:", advisee.advisor.office);
