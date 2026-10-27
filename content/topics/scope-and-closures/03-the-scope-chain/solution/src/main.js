const course = "CS300";
const room = "Main hall";

function describeSection(section) {
  const room = "Room 201";
  console.log(`${course} section ${section} meets in ${room}.`);

  function describeSeat(seat) {
    console.log(`Seat ${seat}: ${course}, section ${section}, ${room}.`);
  }

  describeSeat(14);
}

describeSection(2);
console.log("At the top level, room is", room);
