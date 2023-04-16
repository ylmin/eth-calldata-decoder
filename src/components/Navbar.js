import { useState, useEffect } from "react";
import {
  Button,
  useColorMode,
  Flex,
  Heading,
  Spacer,
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-router-dom'
import { useHref } from 'react-router'
function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const underlineColor = { light: "gray.500", dark: "gray.400" };
  const [tabIndex, setTabIndex] = useState(1);

  const link = useHref()
  
  useEffect(() => {
    setTabIndex(link === '/safe' ? 1 : 0)
  }, [link])

  return (
    <Flex
      py="4"
      px={["2", "4", "10", "10"]}
      borderBottom="2px"
      borderBottomColor={underlineColor[colorMode]}
    >
      <Spacer flex="1" />
      <Heading maxW={["302px", "4xl", "4xl", "4xl"]}>
        ETH Calldata Decoder
      </Heading>
      <Flex flex="1" justifyContent="flex-end" alignItems={"center"}>
        <Tabs
          mr="6"
          variant="enclosed"
          variant='soft-rounded' colorScheme='green'
          index={tabIndex}
          defaultIndex={link === '/safe' ? 1 : 0}
          onChange={(value) => {
            setTabIndex(value)
          }}
        // isFitted
        >
          <TabList>
            <Tab>
              <Link to="/home">Default</Link>
            </Tab>
            <Tab>
              <Link to="/safe">Safe</Link>
            </Tab>
          </TabList>
        </Tabs>

        <Button onClick={toggleColorMode} rounded="full" h="40px" w="40px">
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
    </Flex>
  );
}

export default Navbar;
