// Mock react-router-dom for testing
export const BrowserRouter = ({ children }) => children;
export const MemoryRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ element }) => element;
export const Navigate = ({ to }) => <div data-testid="navigate" data-to={to} />;
export const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/' });
export const useParams = () => ({});
