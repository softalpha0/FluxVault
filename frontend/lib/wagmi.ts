import { createConfig, http } from "wagmi";
import { COSTON2 } from "./contracts";

export const config = createConfig({
  chains: [COSTON2],
  transports: {
    [COSTON2.id]: http("https://coston2-api.flare.network/ext/C/rpc"),
  },
});