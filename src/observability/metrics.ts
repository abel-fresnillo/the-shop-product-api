import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("the-shop-product-api");

export const productLookups = meter.createCounter("products.lookups.total", {
  description: "Total number of product lookup operations",
  unit: "{lookup}",
});

export const productNotFound = meter.createCounter("products.not_found.total", {
  description: "Product lookups that returned no result",
  unit: "{lookup}",
});

export const searchResultSize = meter.createHistogram(
  "products.search.results",
  {
    description: "Number of results returned by search/category queries",
    unit: "{product}",
    advice: { explicitBucketBoundaries: [0, 1, 5, 10, 25, 50, 100] },
  }
);

const heapGauge = meter.createObservableGauge("nodejs.heap.used", {
  description: "V8 heap used bytes",
  unit: "By",
});

heapGauge.addCallback((result) => {
  result.observe(process.memoryUsage().heapUsed);
});

export function startEventLoopMonitoring(): void {
  const eventLoopLag = meter.createObservableGauge("nodejs.event_loop.lag", {
    description: "Event loop lag in milliseconds",
    unit: "ms",
  });

  let lag = 0;
  const measure = () => {
    const start = Date.now();
    setImmediate(() => {
      lag = Date.now() - start;
      setTimeout(measure, 1000);
    });
  };
  measure();

  eventLoopLag.addCallback((result) => {
    result.observe(lag);
  });
}
