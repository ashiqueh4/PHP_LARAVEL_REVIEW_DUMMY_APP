import { Card, Page, Layout, LegacyCard, Text,EmptyState, Grid,ButtonGroup,Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { AddonListing } from "../components";


export default function PageName() {

  const { t } = useTranslation();
  return (
    <Page>
      <TitleBar
        title="Addon Listing"
      />
   <AddonListing/>
    </Page>
  );
}
