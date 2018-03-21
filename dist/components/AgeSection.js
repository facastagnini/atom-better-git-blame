'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from 'preact-compat';
import moment from 'moment';
import * as ConfigManager from '../ConfigManager';
import * as ColorScale from '../interface/ColourScale';
import * as Analytics from '../stepsize/Analytics';
import * as IntegrationNotification from '../interface/IntegrationNotification';
class AgeSection extends React.PureComponent {
    constructor(...props) {
        super(...props);
        this.state = {
            gradient: ['#000']
        };
        Analytics.track('Tooltip shown', { type: 'age' });
        IntegrationNotification.trackTooltipShown();
    }
    componentWillMount() {
        return __awaiter(this, void 0, void 0, function* () {
            this.totalDays = (Date.now() - new Date(this.props.firstCommitDate).getTime()) / 1000 / 3600 / 24;
            this.pointPosition = (this.props.commitDay / this.totalDays) * 100;
            const gradient = yield ColorScale.colorScale(atom.workspace.getActiveTextEditor());
            this.setState({
                gradient: gradient.map((color) => {
                    return color.hsl().string();
                })
            });
        });
    }
    render() {
        let pointAlign = 'center';
        let pointTransform = 'translateX(-50%) translateX(1px)';
        if (this.pointPosition < 20) {
            pointTransform = 'translateX(-5px)';
            pointAlign = 'left';
        }
        if (this.pointPosition > 70) {
            pointTransform = 'translateX(-100%) translateX(8px)';
            pointAlign = 'right';
        }
        const gradient = this.state.gradient.join(',');
        return (React.createElement("div", { className: "age-graph" },
            React.createElement("div", { className: "markers tight" },
                React.createElement("div", { className: "start" },
                    React.createElement("div", { className: "start-inner" },
                        React.createElement("h1", { title: moment(this.props.firstCommitDate).format(ConfigManager.get('gutterDateFormat')) }, "Repo Created"))),
                React.createElement("div", { className: "end" },
                    React.createElement("div", { className: "end-inner" },
                        React.createElement("h1", null, "Today")))),
            React.createElement("div", { className: "rail", style: {
                    background: `linear-gradient(90deg, ${gradient})`
                } },
                React.createElement("div", { className: "tick", style: {
                        left: `${this.pointPosition}%`,
                    } })),
            React.createElement("div", { className: "markers" },
                React.createElement("div", { className: "point", style: {
                        marginLeft: `${this.pointPosition}%`,
                        textAlign: pointAlign,
                        transform: pointTransform,
                    } },
                    React.createElement("i", { className: "icon icon-git-commit" }),
                    React.createElement("p", null, moment(this.props.commit.commitedAt).fromNow()),
                    React.createElement("code", null, moment(this.props.commit.commitedAt).format(ConfigManager.get('gutterDateFormat')))))));
    }
}
export default AgeSection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWdlU2VjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jb21wb25lbnRzL0FnZVNlY3Rpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEtBQUssYUFBYSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sS0FBSyxVQUFVLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxLQUFLLFNBQVMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRCxPQUFPLEtBQUssdUJBQXVCLE1BQU0sc0NBQXNDLENBQUM7QUFZaEYsZ0JBQWlCLFNBQVEsS0FBSyxDQUFDLGFBQWlEO0lBTTlFLFlBQVksR0FBRyxLQUFZO1FBQ3pCLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUM7U0FDbkIsQ0FBQTtRQUNELFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbEQsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRUssa0JBQWtCOztZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsRyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUs7b0JBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzlCLENBQUMsQ0FBQzthQUNILENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVELE1BQU07UUFDSixJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7UUFDeEQsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNCLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztZQUNwQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0IsY0FBYyxHQUFHLG1DQUFtQyxDQUFDO1lBQ3JELFVBQVUsR0FBRyxPQUFPLENBQUM7UUFDdkIsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxNQUFNLENBQUMsQ0FDTCw2QkFBSyxTQUFTLEVBQUMsV0FBVztZQUN4Qiw2QkFBSyxTQUFTLEVBQUMsZUFBZTtnQkFDNUIsNkJBQUssU0FBUyxFQUFDLE9BQU87b0JBQ3BCLDZCQUFLLFNBQVMsRUFBQyxhQUFhO3dCQUMxQiw0QkFBSSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxtQkFFdEYsQ0FDRCxDQUNGO2dCQUNOLDZCQUFLLFNBQVMsRUFBQyxLQUFLO29CQUNsQiw2QkFBSyxTQUFTLEVBQUMsV0FBVzt3QkFDeEIsd0NBQWMsQ0FDVixDQUNGLENBQ0Y7WUFDTiw2QkFBSyxTQUFTLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRTtvQkFDM0IsVUFBVSxFQUFFLDBCQUEwQixRQUFRLEdBQUc7aUJBQ2xEO2dCQUNDLDZCQUFLLFNBQVMsRUFBQyxNQUFNLEVBQUMsS0FBSyxFQUFFO3dCQUMzQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHO3FCQUMvQixHQUFJLENBQ0Q7WUFDTiw2QkFBSyxTQUFTLEVBQUMsU0FBUztnQkFDdEIsNkJBQUssU0FBUyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUU7d0JBQzVCLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUc7d0JBQ3BDLFNBQVMsRUFBRSxVQUFVO3dCQUNyQixTQUFTLEVBQUUsY0FBYztxQkFDMUI7b0JBQ0MsMkJBQUcsU0FBUyxFQUFDLHNCQUFzQixHQUFHO29CQUN0QywrQkFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUs7b0JBQ3ZELGtDQUNHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQzlFLENBQ0gsQ0FDRixDQUNGLENBQ1AsQ0FBQTtJQUNILENBQUM7Q0FDRjtBQUVELGVBQWUsVUFBVSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdwcmVhY3QtY29tcGF0JztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCAqIGFzIENvbmZpZ01hbmFnZXIgZnJvbSAnLi4vQ29uZmlnTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBDb2xvclNjYWxlIGZyb20gJy4uL2ludGVyZmFjZS9Db2xvdXJTY2FsZSc7XG5pbXBvcnQgKiBhcyBBbmFseXRpY3MgZnJvbSAnLi4vc3RlcHNpemUvQW5hbHl0aWNzJztcbmltcG9ydCAqIGFzIEludGVncmF0aW9uTm90aWZpY2F0aW9uIGZyb20gJy4uL2ludGVyZmFjZS9JbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbic7XG5cbmludGVyZmFjZSBJQWdlU2VjdGlvblByb3BzIHtcbiAgZmlyc3RDb21taXREYXRlOiBEYXRlXG4gIGNvbW1pdERheTogbnVtYmVyXG4gIGNvbW1pdDogYW55XG59XG5cbmludGVyZmFjZSBJQWdlU2VjdGlvblN0YXRlIHtcbiAgZ3JhZGllbnQ6IEFycmF5PHN0cmluZz47XG59XG5cbmNsYXNzIEFnZVNlY3Rpb24gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElBZ2VTZWN0aW9uUHJvcHMsIElBZ2VTZWN0aW9uU3RhdGU+IHtcblxuICB0b3RhbERheXM6IG51bWJlcjtcbiAgcG9pbnRQb3NpdGlvbjogbnVtYmVyO1xuICBzdGF0ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKC4uLnByb3BzOiBhbnlbXSl7XG4gICAgc3VwZXIoLi4ucHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBncmFkaWVudDogWycjMDAwJ11cbiAgICB9XG4gICAgQW5hbHl0aWNzLnRyYWNrKCdUb29sdGlwIHNob3duJywgeyB0eXBlOiAnYWdlJyB9KTtcbiAgICBJbnRlZ3JhdGlvbk5vdGlmaWNhdGlvbi50cmFja1Rvb2x0aXBTaG93bigpO1xuICB9XG5cbiAgYXN5bmMgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMudG90YWxEYXlzID0gKERhdGUubm93KCkgLSBuZXcgRGF0ZSh0aGlzLnByb3BzLmZpcnN0Q29tbWl0RGF0ZSkuZ2V0VGltZSgpKSAvIDEwMDAgLyAzNjAwIC8gMjQ7XG4gICAgdGhpcy5wb2ludFBvc2l0aW9uID0gKHRoaXMucHJvcHMuY29tbWl0RGF5IC8gdGhpcy50b3RhbERheXMpICogMTAwO1xuICAgIGNvbnN0IGdyYWRpZW50ID0gYXdhaXQgQ29sb3JTY2FsZS5jb2xvclNjYWxlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBncmFkaWVudDogZ3JhZGllbnQubWFwKChjb2xvcikgPT4ge1xuICAgICAgICByZXR1cm4gY29sb3IuaHNsKCkuc3RyaW5nKCk7XG4gICAgICB9KVxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBwb2ludEFsaWduID0gJ2NlbnRlcic7XG4gICAgbGV0IHBvaW50VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTUwJSkgdHJhbnNsYXRlWCgxcHgpJztcbiAgICBpZih0aGlzLnBvaW50UG9zaXRpb24gPCAyMCkge1xuICAgICAgcG9pbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtNXB4KSc7XG4gICAgICBwb2ludEFsaWduID0gJ2xlZnQnO1xuICAgIH1cbiAgICBpZih0aGlzLnBvaW50UG9zaXRpb24gPiA3MCkge1xuICAgICAgcG9pbnRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtMTAwJSkgdHJhbnNsYXRlWCg4cHgpJztcbiAgICAgIHBvaW50QWxpZ24gPSAncmlnaHQnO1xuICAgIH1cbiAgICBjb25zdCBncmFkaWVudCA9IHRoaXMuc3RhdGUuZ3JhZGllbnQuam9pbignLCcpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFnZS1ncmFwaFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1hcmtlcnMgdGlnaHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0YXJ0XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0YXJ0LWlubmVyXCI+XG4gICAgICAgICAgICAgIDxoMSB0aXRsZT17bW9tZW50KHRoaXMucHJvcHMuZmlyc3RDb21taXREYXRlKS5mb3JtYXQoQ29uZmlnTWFuYWdlci5nZXQoJ2d1dHRlckRhdGVGb3JtYXQnKSl9PlxuICAgICAgICAgICAgICAgIFJlcG8gQ3JlYXRlZFxuICAgICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlbmRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZW5kLWlubmVyXCI+XG4gICAgICAgICAgICAgIDxoMT5Ub2RheTwvaDE+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmFpbFwiIHN0eWxlPXt7XG4gICAgICAgICAgYmFja2dyb3VuZDogYGxpbmVhci1ncmFkaWVudCg5MGRlZywgJHtncmFkaWVudH0pYFxuICAgICAgICB9fT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpY2tcIiBzdHlsZT17e1xuICAgICAgICAgICAgbGVmdDogYCR7dGhpcy5wb2ludFBvc2l0aW9ufSVgLFxuICAgICAgICAgIH19IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1hcmtlcnNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvaW50XCIgc3R5bGU9e3tcbiAgICAgICAgICAgIG1hcmdpbkxlZnQ6IGAke3RoaXMucG9pbnRQb3NpdGlvbn0lYCxcbiAgICAgICAgICAgIHRleHRBbGlnbjogcG9pbnRBbGlnbixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogcG9pbnRUcmFuc2Zvcm0sXG4gICAgICAgICAgfX0+XG4gICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJpY29uIGljb24tZ2l0LWNvbW1pdFwiIC8+XG4gICAgICAgICAgICA8cD57bW9tZW50KHRoaXMucHJvcHMuY29tbWl0LmNvbW1pdGVkQXQpLmZyb21Ob3coKX08L3A+XG4gICAgICAgICAgICA8Y29kZT5cbiAgICAgICAgICAgICAge21vbWVudCh0aGlzLnByb3BzLmNvbW1pdC5jb21taXRlZEF0KS5mb3JtYXQoQ29uZmlnTWFuYWdlci5nZXQoJ2d1dHRlckRhdGVGb3JtYXQnKSl9XG4gICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFnZVNlY3Rpb25cbiJdfQ==