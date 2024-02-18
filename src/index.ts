import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { fetch } from "undici";
import * as fs from "fs";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// /benchmark
app.get("/benchmark", async (c) => {
  const data = await fetch(
    "https://json.bselivefeeds.indiatimes.com/marketband.json"
  );
  const NiftyData = await fetch(
    "https://json.bselivefeeds.indiatimes.com/ET_Community/liveindices?outputtype=json&indexid=1913&exchange=50&company=true&pagesize=500&sortby=percentchange&sortorder=desc&language=&callback=objIndices.getDataCB"
  );
  const textData = (await data.text()).trim().slice(15, -1);
  const JSONData = JSON.parse(textData);
  const NifyTextData = (await NiftyData.text()).trim().slice(21, -1);
  const NiftyJSONData = JSON.parse(NifyTextData);
  return c.json([
    JSONData.marketBandList
      .map((item: any) => item.bandServiceMetas)[0]
      .map((data: any) => {
        return [
          {
            name: data.serviceName,
            open: data.open,
            high: data.high,
            low: data.low,
            current: data.current,
          },
        ];
      }),
    Number(NiftyJSONData.searchresult.index.indexvalue.lastvalue),
  ]);
});

app.get("/stockDetails", async (c) => {
  const data = await fs.promises.readFile(`src/stockDetails.json`);
  return c.json(JSON.parse(data.toString()));
});

const port = parseInt(process.env.PORT!) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
