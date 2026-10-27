import ms from "ms";

const sessions = ["30m", "1h", "1.5h"];

const list = document.querySelector("#sessions");
for (const session of sessions) {
  const item = document.createElement("li");
  item.textContent = `${session} is ${ms(session) / 1000} seconds`;
  list.append(item);
}

const total = sessions.reduce((sum, session) => sum + ms(session), 0);
document.querySelector("#total").textContent = `Planned today: ${ms(total, { long: true })}`;
