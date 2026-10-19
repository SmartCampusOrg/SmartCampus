import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import Version from '@components/Version/Version';
import GoogleButton from '@components/Buttons/GoogleButton/GoogleButton';
import ContinueButton from '@components/Buttons/ContinueButton/ContinueButton';
import MainButton from '@components/Buttons/MainButton/MainButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@icons/icons';
import './LandingPage.css';
import arrowsUp from './arrows_up.png';
import arrowsLeft from './arrows_left.png';
import pansim from './pansim.png';
import building from './building.webp';
import dots from './dots.png';
import logoBackground from './logo.svg';
import lekcja from './lekcja.png';
import building2 from './building2.webp';
import building3 from './building3.webp';
import mapImg from './map.png';
import Lekcja from "../plan-zajec/Lekcja";
import { color, scale } from "framer-motion";
import LogoFull from "../../components/Logo/LogoFull";
import LandingNavBar from "../../components/LandingNavBar/LandingNavBar";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const LandingPage = () => {
  const { user, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const isBetaDomain = window.location.hostname === "smartcampusweb-beta.netlify.app";

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main>
      <section className="LandingPageBanner">
        <LandingNavBar />
      </section>

      <section className="LandingPageLogin">
        <div className="LandingPageLogin__title">
          <img className="LandingPageLogin__arrowsUp" src={arrowsUp}></img>
          <p>Wejdź na wyższy</p>
          <p><span className="text_fat text_highlight">level</span> studiowania</p>
        </div>
        <div className="LandingPageLogin__description">
          <p><span className="text_fat text_highlight">Smart Campus</span> to innowacyjna</p>
          <p>platforma usprawniająca życie</p>
          <p>akademickie!</p>
        </div>

        {!user ? (
        <div className="LandingPageLogin__login">
          <img className="LandingPageLogin__arrowsLeft" src={arrowsLeft}></img>
          <GoogleButton onClick={() => navigate("/Logowanie")}>
          </GoogleButton>
        </div>
        ) : (
        <div className="LandingPageLogin__login">
          <img className="LandingPageLogin__arrowsLeft" src={arrowsLeft}></img>
          <ContinueButton onClick={() => navigate("/Panel")}>
          </ContinueButton>
        </div>
        )}
        <div className="LandingPageLogin__logoPansim">
          <img src={pansim}></img>
          <p className="text_x">X</p>
          <div>
            <p>Koło naukowe</p>
            <p>informatyki stosowanej</p>
          </div>
        </div>
        <div className="LandingPageLogin__campusImage">
          <img className="LandingPageLogin__campusImage_img" src={building}></img>
          <img className="LandingPageLogin__dots0" src={dots}></img>
          <img className="LandingPageLogin__dots1" src={dots}></img>
          <img className="LandingPageLogin__dots2" src={dots}></img>
        </div>
      </section>

      <section className="LandingPageInfo">

        <div className="LandingPageInfo__half">
          <div className="LandingPageInfo__questionSquare">
            <span className="fat_text">Czym jest?</span>Smart Campus
            <img className="logo_background" src={logoBackground} alt="logo background" />
          </div>


          <div className="LandingPageInfo__descriptionSquare">
            <img className="LandingPageLogin__dots3" src={dots}></img>
            <div className="LandingPageInfo__squareText1">
              <p>Projekt Koła Naukowego Informatyki</p>
              <p>Stosowanej</p>
            </div>
            <div className="LandingPageInfo__squareText2">
              <p>Smart Campus to platforma, która łączy wszystko, czego</p>
              <p>potrzebuje student - plan zajęć, mapę kampusu i aktualności -</p>
              <p>w jednym, intuicyjnym miejscu.</p>
            </div>
            <div className="LandingPageInfo__descriptionSquare--bottom">
              <div className="LandingPageInfo__descriptionSquare--bottomHalf">
                <p>Zespół Smart Campus:</p>
                <div className="LandingPageInfo__descriptionSquare--bottomHalf2">
                  <FontAwesomeIcon icon={Icons.faUser} />
                  <FontAwesomeIcon icon={Icons.faUser} />
                  <FontAwesomeIcon icon={Icons.faUser} />
                </div>
              </div>
              <div className="LandingPageInfo__descriptionSquare--bottomHalf">
                <p>Technologie:</p>
                <div className="LandingPageInfo__descriptionSquare--bottomHalf2">
                  <MainButton className="LandingPageInfo__technologyTag" type="primary" text="React" onClick={() => window.open('https://react.dev/', '_blank')}/>
                  <MainButton className="LandingPageInfo__technologyTag" type="primary" text="Firebase" onClick={() => window.open('https://firebase.google.com/', '_blank')}/>
                </div>
                </div>
              </div>
            </div>
          </div>
        <div className="LandingPageInfo__half">
          <div className="LandingPageInfo__planSquare">
            <div className="LandingPageInfo__square--wrapper">
              <div><div className="LandingPageInfo__circleIcon"><FontAwesomeIcon icon={Icons.faCalendarDays} color="white" size="xl"/></div></div>
              <div className="LandingPageInfo__squareText3">Plan zajęć</div>
              <div className="LandingPageInfo__squareText2">
                <p>Wygodny, dynamiczny plan zajęć oraz</p>
                <p>czytelny terminarz zjazdów. Od teraz</p>
                <p>niczego nie przegapisz!</p>
              </div>
              <div className="LandingPageInfo__square--img"><img src={lekcja}></img></div>
            </div>
          </div>
          <div className="LandingPageInfo__imageSquare"><img src={building2}></img></div>
          <div className="LandingPageInfo__mapSquare">
            <div className="LandingPageInfo__square--wrapper">
              <div><div className="LandingPageInfo__circleIcon"><FontAwesomeIcon icon={Icons.faMap} color="white" size="xl"/></div></div>
              <div className="LandingPageInfo__squareText3">Mapa kampusu</div>
              <div className="LandingPageInfo__squareText2">
                <p>Łatwa, przejrzysta i wygodna, </p>
                <p>pomoże Ci poruszać się po kampusie</p>
                <p> oraz najbliższej okolicy.</p>
              </div>
              <div className="LandingPageInfo__square--img"><img src={mapImg}></img></div>
            </div>
          </div>
        </div>
      </section>

      <section className="LandingPageNumbers">
        <div className="LandingPageNumbers--title"><p>Smart Campus w liczbach</p></div>
        <div className="LandingPageNumbers--bottom">

          <div className="LandingPageNumbers__block">
            <div className="LandingPageNumbers__block--top"><FontAwesomeIcon icon={Icons.faUser}/></div>
            <div className="LandingPageNumbers__block--bottom">
              <div className="LandingPageNumbers__blockBottomText1"><p>2</p></div>
              <div className="LandingPageNumbers__blockBottomText2"><p>Użytkowników platformy</p></div>
            </div>
          </div>

          <div className="LandingPageNumbers__block">
            <div className="LandingPageNumbers__modulesBlock">
              <div className="LandingPageNumbers__block--bottom">
                <div className="LandingPageNumbers__blockBottomText1 LandingPageNumbers__modulesBlockTextAdjustment"><p>5</p></div>
                <div className="LandingPageNumbers__blockBottomText2 LandingPageNumbers__modulesBlockTextAdjustment"><p>Smart modułów</p></div>
              </div>
            </div>
            <div className="LandingPageNumbers__block--bottom LandingPageNumbers__block--Empety"></div>
          </div>

          <div className="LandingPageNumbers__block">
            <img className="LandingPageNumbers__block--top" src={building3}></img>
            <div className="LandingPageNumbers__block--bottom">
              <div className="LandingPageNumbers__blockBottomText1"><p>2</p></div>
              <div className="LandingPageNumbers__blockBottomText2"><p>Budynki objęte projektem</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="LandingPageFooter">
        <div className="LandingPageFooter__part1">
          <div className="LandingPageFooter_logo_part"><LogoFull colorReverse="reverse" /><p className="beta">BETA</p></div><p><Version /></p>
        </div>
        <div className="LandingPageFooter__part2">
          <div><p>Skontaktuj się z nami po więcej</p><p>informacji.</p></div>
          <div className="LandingPageFooter__contact">
            <div>
              <p><span className="text_fat">Kontakt</span></p>
              <p><span className="text_underline">smartcampuspansim@gmail.com</span></p></div>
            <div>
              <p><span className="text_fat">Zgłoś błąd</span></p>
              <p>SmartCampusWeb.netlify.app/zglosblad</p>
            </div>
          </div>
        </div>
        <div className="LandingPageFooter__part3 LandingPageFooter__separator">
          <div>
            <p>KNIS 2025-2026 Wszelkie prawa zastrzeżone</p>
          </div>
          <div className="LandingPageFooter__part3--right">
            <p>Informacje o plikach cookie</p>
            <p>Polityka prywatności</p>
          </div>
        </div>
      </section>

    </main>
  );
};

export default LandingPage;
