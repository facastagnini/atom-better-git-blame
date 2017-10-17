'use babel';

import shell from 'shell';
import React from 'preact-compat';
import * as ConfigManager from '../ConfigManager';
import * as Analytics from '../stepsize/Analytics';

interface ISearchInLayerProps {
  onClick: Function;
  onMouseEnter: Function;
  onMouseLeave: Function;
}

class SearchInLayer extends React.PureComponent<ISearchInLayerProps, any>{
  stepsizeOnClickHandler() {
    Analytics.track('Powered by Stepsize clicked');
    shell.openExternal(`https://stepsize.com/?utm_source=atom-bgb&ref=${Analytics.userHash}`);
  }

  render() {
    if(ConfigManager.get('searchInLayerEnabled')){
      return (
        <div className="section">
          <div className="section-icon">
            <div className="icon icon-search" />
          </div>
          <div className="section-content">
            <h1 className="section-title">
              Search in&nbsp;
              <img className="layer-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL8AAABACAMAAAB88Fb4AAAC9FBMVEUAAAD///////////////////////////+YI6n///9hOrX///////////+gIKf///////////9hOrX///9hOrX///9/Ma3///9hOrX///////////+iIKb////RHo7///////9+Ma7///////////////////9kObX///////////////////+EK66lIKX///////////9hOrX///////////9hOrWWI6v///////9yM7KpIKNhOrX///9hOrX///+fIKhhOrX///9hOrX////////////RHo7///9hOrWZI6h2MrH///////////9jObX///////+qH6P///////9jObX///9hOrX///////////96MLD///9iObX///////+ALa9qNrN7L7C0H57DH5ZhOrWfIKilH6ZhOrVhOrW3H5zEHpX////FHpWkH6b///////////////9hOrWsH6LAH5f////////////QHo////9hOrWUJKvSHY6sH6K1H52/H5iCLK6NKKyzH55hObaNKKzIHpOfIKm3H5zMHpF1MbFgOrXEHpXHHpSnIKRdO7b///9gOrWiIKfIHpObIanLHpKWJKrNHpGUJarKHpLRHo+yH567H5nGHpSRJqtXPrdsNrOAL62FK66gIKi1H52CLa6vGqVoN7SQJqt9Lq+fIKiuH6C4H5tiOrVvNLLaHoq2H5yfIKjQHo7///9hOrWfIKjRHo60H524H5uQJquvH6C/H5iIKa2sH6GNJ6ypH6OyH57DH5a7H5nHHpSUJapeO7ZrNrN0MrF4MLCCLK5mOLSmIKSLKK3THo1vNLJ9Lq+ELK6GKq6dIKnJHpJcPLZ6L7C2H519L6+kH6exH5+8H5p/La+BLa6bIamrH6KYI6qaIqq6H5pjObWiH6elH6W9H5nNHpCzH59zM7KTJauSJavBH5fFHpXVHoxxNLLLHpLQHY9uNbKnHaZ2MbFVP7haPbdZPbeWI6uhIKisHqPYHotOQbo1nmgGAAAAs3RSTlMAfNpqLdVx+f6WgAl5GP3x9ebfhP1VBf2CYBID/ctTPg0M49e+jHVFNTIpJRwb/O3qx7KhmZJOSkMvE/vo37i0p6WPem9pZFtILCL++/fPvK+opaOYioZdWVFKRzgjIBb+/f39/fbz5dvKnp6JiIeBf2xNOOXl3MK6np2XjouHh4VmRSca/vfr5d3U08e7t66rbGViUUk5MPXm5uXl5eLf3trY0c7EuaqnfHl2cXBfUEo0H859xgEAAAk+SURBVGje7dh1VBRBHMDxny2ehQoqFigodgd2d3d3d3d3d3d3755wHBziHQh6BoKUAiJgYHf948zO7M7usWe/B7zn5x/vDnx8Z3dmdvfgv//+mU1zxowZM3/+vHnz5s6dOxbJIpevD6Rwa3bu2DNlyu7ly3dNnjx5GLJ/Xy6mdguAFk6Qci2KND4y+uqveLhf9vT2uR4erw0M8eMZe4AhDSDlmp8QGxzM+uPDTU+ffGT5XQCceH4SpFir9R6RRll/dp3Oi2cnAE2fajxfG1Iqp8H6K+4JRqn/utZg1rX6wFPDAaAB+rcuWNEkKySrTfjQX07wlfozGwzmoIchtH8WGuEQ/KIbqCrOdYZktQb3P47Q68X1a9IZvLxaif0l8PQRqO6j9TiuOCQn+6XC1PccRPt9sj9F/bcDr+EBkHnfhc0kCyXTchyXBpLTFrp0owclkH5totDfyk+cPlCbJ5Jsovk5Ltn7Z4hbj0+ohzB/HgjH/96tAcIJqAYwicfIG6Wcyd9vvxT1Rwr9PqHunt7R8TEmoT+sVR50BobYA8ziJTVBYWry928JFvu9r0fj/uy0/27AAD8yZYaz/hGgkDb5++cEs0tXnPdlb587Yv/Vlw/98O7Th5fpktL6V8j6rxf0jPCJyiz1D/DD0ycLL1ciZfVve/0q2PdZZGzoY9wfFx4R/0Dqv+n/sC6dPkyen/YX0BSAP5ItvVtpR7DKwUGjMn1eBxsHo/k/aJCnd61y5bLHx0Wx/gHXqgG04JXq2v+g366Kc9ryOSsU6tQdADTpMmIOYJdRMBHkipAPa4DA1WW6LYe0KdY+Yz8QuYm/ohnvbNs6b462lXuC0oEv5Qpi2alli1piZbHFNfF2s+CjdOgFfDer/ROKcpIMRcCRvHKFKhyhOH4VyGf5ASlVj5PJNBqoNBxWDNxsOZFzKQ0wi7+9C4+KeSCIwuqDpaN3Q64p9LHSX7Itp9AdyL/pwSEvedVUfvjJR0UB6cpZSOsGgnQcNq13a47JMQ6YM/z7geEPMjObwULN8LcveX+ZdqDe78pZym1L+6Ey+aAeMM7ko3RAf6qUN72svzzKZ6q6ATOC93s/UGt6aqK224OFjdq3Uf7+N5mz6v2luKQyif296Xu2OvvSg4mWelVORQ4N61coDzKLeR4NoH+UTnQcLNXXar/o/K8yNZP205eUbcVpdTiK9gP9oAmIxpEPZgL0lEbrbNO1s3Mb+m69lX7Fw0Y3Hg/gY9hTs9mAbvrN5gVgwX6oVqt9G/QyQLQSVPsbS5OmNCBl0uVU9Deli1raY3OQD0pJ6zhTOgeySzbhiNKK/rRd7Wr0yF2HywFy63gs5EOYwYsoCxY2a5Hwz2EBt6gT6v1056mQXtrMi8n7C9DhlAGEjcdZepUD5VK9yWofzfrZFtepMcg45eEFfiEDvQKxI2rTBw8g6ta9+0RZ1f4idNllA4nGVtYPncjrjEDQraoGQCHxRDBZyTRk/YqNSzl96AD8BgaGIQvA0lCt4O3T/kGCg6Da31Ca34ydvL8kR7dyQSlpLTqSNd4V5HKQIUn9FUFdA14U4tfqLprcNcHCVi0VrgsyeyGz1fsrss2cKcr6yW8gJQFbT94UB2hOXtkUz8o0JmfOTuqfCOpq8xK/PC+vPlkJlmaL/XHaJWYDslW9n/zFDqDgIu9PJ5vIGno9c6TrXl066T/1BVUlcDgbgP+bLmBpmVYawB0dshdU+x3akL0HFLrL+zVkokyVrd72AJDben9xsb91P1BTbQSvGAB/rQVYuKBl4jInmkyz1fuz5aV/UaG5vB+qsgmUgb10sd6fVezPZKU/S5d8WfIJGgk2gKWTWpnPMTExC9X7+2VSO/52rJ9dcTsDuLJV+aPjP17qzwZ/6JBW4cFQJ/X+AuQiVBkUxiv6IYO4xkfL7jwn0AtbUsXsftJvDz9T9tMdRovUB/V+up/XAYUMyn47cTFWEG99kBrsYpvET/on5RvRrl27unXrViLWHavfsX5HZCQyCpmxOrwWUg4pGBf3GfVXt9ZfWWWj680p+2l3/jIcm2zi/m/zB/32Fk9WH/wT38Zf9/H2vOzucUXvawx+9NV4OdT9cQT6UsIHf60eNxSs9XeXbieZYsp+8SJXaLriVqIQPQG/1882UCYk4HZmH0X/jRuxj3E/GkA0+l43fq3Vfk1OuiYdQNSes+wvzck4A8IWgK0bSErXa/xr/ZBPvn8+vB94O/sXef+lF69D3YUzQE7BRmv97BmkfH66d5IfKfphOsf0ZjcLhAu9Srna4Gvvr/XDKtnhf4Nu4Jb4RLP+1zcuvTCGeoS6u19Gc8g7upaT9f4yeaXb/w5dc89Ec0elvwf7cKp8l6UKVXapWq8O3Zx+rb+mrP9qYGDQbZOn2P88+BLydbBHLBrBYzyCtWC9H5pwSeVV9LO7aOWlbianJrd6v/Vb0IcBt+4HeXkVjBD7X91A/Tcu6WOv4BGgAZz6Qb/aY2DDohb97GqVUwNMe7V+F9V+6/egIdfCwvrf9jIboh9HkP5HuP/Si0cJCZGxHh5oErX8YT+MTnL/ktOy30EaGsg1TFJv2xN+sd8+Fz3+b+7evRfoZTBnjnAn8x8de2EAr/R6PILQw5AE/UYAiJ6F5M/ZTcQfuwLTgSNKgUKReor6omno6UnDtlor2NezTwJwv9lgLuiB+58Fo3wyAOOzZ/qEKx6nIYlxNkjn5myBtqe7SbHxjmi657bB5H/dxdoDSUmXtnQHqNPJjo2rsw1S1RF+ZAOZ/k/e3b0VGGQ26HTesbj/FenHS8Do6/tMH7kIfoHGtUf+/D3SgxV0eM1BRT/X5hN7FikDv60d7r/25KqwgFF/TGhkrH4wnv50AK+fP/d9NgX+FrtMwz/lhJ/D/F9eDQgT+k2J2a9EJhhJPhnAI6Px+Rj4S+yObhz8W5N4/qH/TdTf/zbqf/op0ds38tWLS8yNV8HGbfB32EN8a0f4x7Kg/jdoAeAFrEs0xcSEPkcXX7lHK+Dv2XD0MfmfW0X6b+ENKNGU+dMdX3L4mRnwd9gjMFcE/jmnEiVK9MIWLqwuOH+usKiZ4CL8tQn0NgdSqULirVnq5Eby22ggdeog3vqkThqOcIDUKT/JnwapVHnxK/PUqQaXE2mTajfPIp2qYI3hv/+S3XeK6ZiwV2uerQAAAABJRU5ErkJggg==" height="16" alt=""/>
            </h1>
            <p className="section-body">
              View complete history of the code block
              <span
                className="layer-button btn btn-default icon icon-link-external"
                onClick={this.props.onClick}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
              >
                Open
              </span>
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="section powered-by">
        <div className="section-content">
          <p className="section-body" style={{ maxWidth: '100%' }}>
            Powered by&nbsp;
            <a onClick={this.stepsizeOnClickHandler}><img className="layer-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANkAAABACAMAAACgCSLPAAAC+lBMVEUAAAD///////////////////////////9hOrX////////////////////////////////////////////RHo5hOrX////////////////////////////////////RHo7///+fIKj////////////////////////////////////////GIpL////////////////RHo7///////////////////////////+bKaS4JZb///////+eIKlhOrWgH6hiOrT///////////////+WIK3////////////////////SHo7///////+eIKn///////////////////////////////9kObSwIJ9+Lq/////RHo7///+gH6j///9hOrX////////////////////PHo////////////9rOLL////SHo7///9gOrX////RHo5hOrV2Na7////CH5WNK6mhI6WjJaLAI5TNHpDRHo7///+gH6j///////+hIqZxNrD////RHo7///9fOrZjOLVeO7bSHo6xJplhOrVhOrXRHo7LH5FhOrWjKZ6sI5+aKKRhOrXUHo3////THo2TKKhhOrWwH6BhOrVgOrWAMqvZHouAMK26IZjRHo5rN7NhOrW2JJjAIpSfIKjRHo64H5xnN7S4JJdePLbRHo6HMaihJaNgOrXVHY2fIKifIKhhOrXBH5bRHo6rKJthOrVcPbaVIK16NKyxGaWGMajRHo6SLqSvIKD///+CMamfIKjRHo7////RHo5hOrWfIKhWP7erG6aDMqqQLqWYIKx/M6uJMKeXLaLXHYuGMaiTLqReO7ZtN7GhHqmaK6J0NLB8M6ynHKeNL6alKZ7VHY1xNrB2Na6eIKmMMKatIKGoKJ1oOLKcH6ueK6CsJ5ukHqeULaOvJ5rTHo6ALa95NK2YJKmiKp9bPbayJpm2JZjZHIvbHYpcO7eHKq27IpdaPLePJa2dK6GgKqB8L7CpH6OhLJ3CH5a0F6RUPrnmGYfDb/oYAAAAwHRSTlMAk9mqmKKQif4TrJ/2SfnlROfdgn9jVTEnJRkQBAL93rWqpZvPwr2GfG1TF/7718rFpJeRaV1NLA0G/u7s2bl1WlA3CAb+4dK5sKGblY16d3NaQTMu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" height="16" alt=""/></a>
          </p>
        </div>
      </div>
    )
  }
}

export default SearchInLayer;
