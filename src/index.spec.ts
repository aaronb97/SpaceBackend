import axios from "axios";

describe("/planets", () => {
  test("it should fetch the planets", async () => {
    const result = await axios.get("http://localhost:3000/planets");
    const data = result.data;

    expect(data.some((planet: { name: string }) => planet.name === "Earth"));
    expect(data.some((planet: { name: string }) => planet.name === "The Sun"));
  });
});
