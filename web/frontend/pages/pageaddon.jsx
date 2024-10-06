import React from 'react'
import { AddonCreate } from '../components'
import { Card, Page, Layout, TextContainer, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

const pageaddon = () => {
    
  return (
    <Page>
    <TitleBar
      title={"Addon Create"}
    />
    <AddonCreate/>
    </Page>
  )
}

export default pageaddon;