import '../styles/components/loader.css';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="loader-text">Загрузка</div>
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;
