// Descriptive Colors

const teddyBlueLight = '#45A3F7';
const teddyBlueDark = '#101042';
const bluePastel = '#daedfd';
const charcoal = '#060622';
const red = '#F7655E';
const redPastel = '#F4B8B8';
const green = '#23C38A';
const greenPastel = '#BDEFDA';
// const black = '#000';
const white = '#fff';
const paperWhite = '#f9f9f9';
// const blueGray = '#496089';
const lightGray = '#f2f2f2';
const mediumGray = '#bbb';
// const eggshellGray = '#414168';
const eggshellGray = '#717198';
const darkGray = '#343434';

class TeddyWebTheme {
  public activeLinkColor = green;
  public activePageColor = teddyBlueLight;
  public applicationBackgroundColor = white;
  public applicationTextColor = darkGray;
  public blockColorActive = greenPastel;
  public blockColorDefault = bluePastel;
  public blockColorInactive = lightGray;
  public blockColorWarning = redPastel;
  public boxShadowColor = lightGray;
  public buttonColorActive = teddyBlueLight;
  public buttonColorActiveSecondary = mediumGray;
  public buttonColorDisabled = lightGray;
  public buttonColorPassive = teddyBlueLight;
  public buttonTextColor = white;
  public cardHeaderColor = teddyBlueLight;
  public darkModeTextColor = paperWhite;
  public dotColorActive = teddyBlueLight;
  public dotColorPassive = eggshellGray;
  public dropdownContainerColor = eggshellGray;
  public headerBackgroundColor = white;
  public headerBorderColor = teddyBlueDark;
  public headerTextColor = teddyBlueDark;
  public inputBackgroundColor = lightGray;
  public onboardingBackgroundColor = teddyBlueDark;
  public pageHeaderColor = darkGray;
  public passiveLinkColor = teddyBlueLight;
  public subheaderTextColor = eggshellGray;
  public lightIconColor = mediumGray;
  public textColor = charcoal;
  public upvoteColor = green;
  public warningColor = red;
  private padding_increment = 5;
  public pad(x: number) {
    return `${x * this.padding_increment}px`;
  }
  public pwa_footer_height = this.pad(16);
}

export const theme = new TeddyWebTheme();
