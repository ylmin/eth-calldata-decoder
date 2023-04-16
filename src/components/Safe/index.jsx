import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Textarea,
  FormControl,
  useColorMode,
  FormLabel,
  Box,
  Button,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import Output from "./Output";
import { UnlockIcon } from "@chakra-ui/icons";

import { decodeWithSelector, getSafeTransactionDatas, asyncPool } from "./safe";

export const SafePage = () => {
  const bgColor = { light: "white", dark: "gray.700" };
  const { colorMode } = useColorMode();
  const [link, setLink] = useState("");

  const [datas, setDatas] = useState([]);

  const getDatas = useCallback(
    async (link) => {
      try {
        const result = await getSafeTransactionDatas(link);
        if (result?.length > 0) {
          const requestLists = [];

          for (let index = 0; index < result.length; index++) {
            const data = result[index].data;
            requestLists.push(decodeWithSelector(data));
          }
          const timeout = (i) =>
            new Promise((resolve) => setTimeout(() => resolve(i), i));

          const decodeData = await asyncPool(5, requestLists, timeout);
          console.log(decodeData, "decodeData");
          setDatas(decodeData);
          return decodeData;
        }
        return [];
      } catch (error) {
        setDatas([]);
        return [];
      }
    },
    [link]
  );

  return (
    <Container my="16" minW={["0", "0", "2xl", "2xl"]}>
      <FormControl>
        <FormLabel>Enter Safe Link</FormLabel>
        <Textarea
          placeholder="Safe Link"
          aria-label="Safe Link"
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}
          bg={bgColor[colorMode]}
        />
      </FormControl>
      <Center>
        <Button
          onClick={() => getDatas(link)}
          leftIcon={<UnlockIcon />}
          style={{ marginTop: "20px" }}
          colorScheme="blue"
          disabled={!link}
        >
          Decode
        </Button>
      </Center>
      <Accordion allowToggle style={{ marginTop: "20px" }}>
        {datas?.length > 0 &&
          datas.map((item, index) => {
            const decoded = JSON.stringify(
              {
                allPossibilities: item,
              },
              undefined,
              2
            );
            return (
              <>
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box
                        as="div"
                        flex="1"
                        display="flex"
                        alignItems="center"
                        textAlign="left"
                      >
                        <svg
                          width="24px"
                          height="24px"
                          color={colorMode === "light" ? "#000" : "#fff"}
                          fill="currentColor"
                          focusable="false"
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          data-testid="CodeIcon"
                        >
                          <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
                        </svg>
                        <div
                          style={{
                            fontSize: "16px",
                            paddingLeft: "10px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ width: "100px" }}>
                            Action &nbsp;{index + 1}
                          </div>
                          <span style={{ fontWeight: "600" }}>
                            {item[0].function.split("(")[0]}
                          </span>
                        </div>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Output value={decoded} />
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </AccordionPanel>
                </AccordionItem>
              </>
            );
          })}
      </Accordion>
    </Container>
  );
};

export default SafePage;
