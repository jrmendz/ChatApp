var t = Template.rightdock;
var main =[
	{title: 'menu1', class: 'fa fa-circle', href: '#'},
	{title: 'menu1', class: 'fa fa-calendar', href: '#'},
	{title: 'menu1', class: 'fa fa-dashboard', href: '#'},
	{divider: true},
	{title: 'menu1', class: 'fa fa-user-plus', href: '#'},
	{title: 'menu1', class: 'fa fa-plus-circle', href: '#'},
	{title: 'menu1', class: 'fa fa-comments', href: '#'},
	{divider: true},
	{title: 'menu1', class: 'fa fa-mobile-phone', href: '#'},
	{title: 'menu1', class: 'fa fa-hand-o-up', href: '#'},
	{title: 'menu1', class: 'fa fa-file-o', href: '#'},
	{divider: true},
	{title: 'menu1', class: 'fa fa-bank', href: '#'},
	{title: 'menu1', class: 'fa fa-chain-broken', href: '#'},
	{title: 'menu1', class: 'fa fa-chrome', href: '#'},
	{title: 'menu1', class: 'fa fa-chain-broken', href: '#'},
	{title: 'menu1', class: 'fa fa-envelope', href: '#'},
];
var sub =[
	{title: 'menu1', class: 'fa fa-coffee', href: '#'},
	{divider: true},
	{title: 'menu1', class: 'fa fa-thumbs-o-up', href: '#'},
	{title: 'menu1', class: 'fa fa-bell disabled', href: '#'},
	{title: 'menu1', class: 'fa fa-clock disabled', href: '#'},
	{title: 'menu1', class: 'fa fa-desktop disabled', href: '#'},
	{divider: true},
	{title: 'menu1', class: 'fa fa-bar-chart disabled', href: '#'},
	{title: 'menu1', class: 'fa fa-dot-circle-o disabled', href: '#'},
	{title: 'menu1', class: 'fa fa-circle-o disabled', href: '#'},
	{title: 'menu1', class: 'fa fa-info-circle', href: '#'},
];

t.helpers(
	{
	'mainMenu': function() {
			return main;
		},
	'subMenu': function() {
			return sub;
		}
	}
);