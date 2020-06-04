'use strict';

const el = React.createElement.bind(React);
export function TitleAnimatorPreloaderHOCComponent (props) {
  const [playedAnimation, setPlayedAnimation] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => {
      setPlayedAnimation(true);
    }, 550);
  });
  if (!playedAnimation) {
    return el('div', {
      className: 'preloader-container',
      style: {
        textAlign: 'center'
      }
    }, 'Loading...');
  }
  return (
    props.children
  );
}
