
export const TableSkeletonLoading = () => (
    <>
        <style>{shimmerStyle}</style>
        <div className="shimmer-container shimmer">
            <h6 className="shimmer-text "></h6>
        </div>
        <table className="shimmer-container shimmer">
            <tbody>
                {Array.from({ length: 7 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="shimmer-row">
                        {Array.from({ length: 6 }).map((_, colIndex) => (
                            <td key={colIndex} className="shimmer-cell">
                                <h6 className="shimmer-text2 " ></h6>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

const shimmerStyle = `
     @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  .shimmer {
    animation-duration: 1.0s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    background:	#F7F7F7;
    background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
    background-size: 1000px 104px;
    position: relative;
    overflow: hidden;
  }

  .shimmer-container {
    background-color: 	#F7F7F7;
    border-radius: 4px;
    height: 50px;
    width: 100%;
    margin: 15px;
  }

  .shimmer-text2 {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 55%;
    margin: 15px 0 0 15px;
     position:relative;
     left:10%;
     bottom:10%;
  }
  .shimmer-text {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 15%;
    margin: 15px 0 0 15px;
     
  }
 .shimmer-row {
    display: flex;
  }

  .shimmer-cell {
    flex: 1;
    padding: 10px;
    height: 50px;
    background-color: #F7F7F7;
    border-radius: 4px;
    margin: 5px;
  }
  
  `;