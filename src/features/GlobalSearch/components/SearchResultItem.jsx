import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ToggleSwitch from "@components/ToggleSwitch/ToggleSwitch.jsx";

export const HighlightedText = ({ text, indices }) => {
  if (!indices || indices.length === 0) return <span>{text}</span>;
  return (
    <span>
      {text.split('').map((char, i) => (
        <span key={i} className={indices.includes(i) ? "navbar_search_highlight" : ""}>
          {char}
        </span>
      ))}
    </span>
  );
};

export function SearchResultItem({ result, onClick, isActive, isDark }) {
  return (
    <div className={`navbar_search_resultItem ${isActive ? 'navbar_search_resultItem--active' : ''}`} onClick={() => onClick(result)}>
      <div className="navbar_search_resultItem_left">
        <div className="navbar_search_resultItem_icon">
          <FontAwesomeIcon icon={result.icon} />
        </div>
        <div className="navbar_search_resultItem_text">
          <div className="navbar_search_resultItem_title">
            {result.match ? (
              <HighlightedText text={result.title} indices={result.match.indices} />
            ) : (
              result.title
            )}
          </div>
          {result.type && <div className="navbar_search_resultItem_type">{result.type}</div>}
        </div>
      </div>
      <div className="navbar_search_resultItem_right">
        {result.shortcut && (
          <div className="navbar_search_shortcutBadge">
            {result.shortcut.split(' ').map((key, i) => <span key={i}>{key}</span>)}
          </div>
        )}
        {result.component === "themeSwitch" && (
          <div className="navbar_search_componentWrapper">
            <ToggleSwitch id={`themeSwitch_${result.id}`} defaultState={isDark} onToggle={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
